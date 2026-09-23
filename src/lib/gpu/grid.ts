import { clock, effect, frameLoop, init, surface } from "vgpu";
import type { FrameLoopHandle, Gpu, Surface } from "vgpu";
import gridShader from "@/shaders/grid.wgsl";

/** One box the grid must not draw behind, in CSS px within the canvas. */
export interface ClearBox {
  centerX: number;
  centerY: number;
  halfWidth: number;
  halfHeight: number;
}

/**
 * Slots in the shader's clearing array. Must match `MAX_CLEARINGS` in
 * grid.wgsl; `pnpm check:backdrop` reads both and fails if they drift.
 */
export const MAX_CLEARINGS = 6;

/** An empty slot: zero-sized and far off-canvas, so no fragment is near it. */
const PARKED: [number, number, number, number] = [-1e5, -1e5, 0, 0];

/** Packs boxes into the shader's fixed-size array, unioning any overflow into
 *  the last slot rather than dropping a piece of content the grid would then
 *  run straight through. */
export function packClearings(boxes: readonly ClearBox[]): [number, number, number, number][] {
  const slots = boxes.slice(0, MAX_CLEARINGS).map((box) => ({ ...box }));
  for (const extra of boxes.slice(MAX_CLEARINGS)) {
    const last = slots[MAX_CLEARINGS - 1];
    const left = Math.min(last.centerX - last.halfWidth, extra.centerX - extra.halfWidth);
    const right = Math.max(last.centerX + last.halfWidth, extra.centerX + extra.halfWidth);
    const top = Math.min(last.centerY - last.halfHeight, extra.centerY - extra.halfHeight);
    const bottom = Math.max(last.centerY + last.halfHeight, extra.centerY + extra.halfHeight);
    slots[MAX_CLEARINGS - 1] = {
      centerX: (left + right) / 2,
      centerY: (top + bottom) / 2,
      halfWidth: (right - left) / 2,
      halfHeight: (bottom - top) / 2,
    };
  }
  const packed = slots.map(
    (box): [number, number, number, number] => [box.centerX, box.centerY, box.halfWidth, box.halfHeight],
  );
  while (packed.length < MAX_CLEARINGS) packed.push(PARKED);
  return packed;
}

export interface GridHandle {
  /** Crossfades the dots toward the dark or light palette. */
  setDark(dark: boolean): void;
  /** Stops and restarts rendering, e.g. when the hero scrolls out of view. */
  setPaused(paused: boolean): void;
  /** Re-measures where the grid must not draw. Safe to call on every resize. */
  setClearing(clearing: readonly ClearBox[]): void;
  dispose(): void;
}

/** Seconds for the grid to reach full opacity after the first frame. */
const FADE_IN_SECONDS = 0.8;
/** Seconds for a theme switch to cross the palette over. */
const THEME_FADE_SECONDS = 0.4;
/** Seconds for the pointer's influence to appear when it arrives, or leave. */
const POINTER_FADE_SECONDS = 0.35;
/**
 * Longest delta a single frame may advance the easings. The loop stops whenever
 * nothing is moving, so the very next frame after an idle period can be seconds
 * later; without this, one pointer move after a pause would snap rather than ease.
 */
const MAX_DELTA = 1 / 30;
/** How fast the rendered pointer chases the real one, per second. */
const POINTER_EASING = 12;
/** Below this, an easing has arrived and the loop is allowed to stop. */
const SETTLED = 1e-3;
/**
 * How long the mesh stays after a finger lifts, ms. A tap is over in a tenth
 * of a second; without a linger the bubble would fade before it finished
 * appearing, and a touch visitor would never see what the grid does.
 */
const TOUCH_LINGER_MS = 900;

const approach = (value: number, target: number, step: number) =>
  value + Math.max(-step, Math.min(step, target - value));

/**
 * Starts the dot grid on `canvas`.
 *
 * WebGPU support and motion preferences are the caller's to check — this runs
 * unconditionally, so it stays a plain function worth testing on its own.
 */
export async function startGrid(
  canvas: HTMLCanvasElement,
  options: {
    dark: boolean;
    clearing: readonly ClearBox[];
    /**
     * Called if the GPU device is lost out from under the grid -- a driver
     * reset, a GPU switch, some sleep/wake cycles. The grid has already torn
     * itself down; the caller decides whether to start a new one.
     */
    onLost?: () => void;
  },
): Promise<GridHandle> {
  const gpu: Gpu = await init();

  let canvasSurface: Surface | undefined;
  let loop: FrameLoopHandle | undefined;
  let disposed = false;

  const teardown = () => {
    if (disposed) return;
    disposed = true;
    loop?.stop();
    loop = undefined;
    canvasSurface?.dispose();
    gpu.dispose();
  };

  // Without this a lost device leaves the canvas frozen on its last frame, or
  // blank, for the rest of the visit. `destroyed` is our own teardown.
  void gpu.gpu.lost.then((info) => {
    if (disposed || info.reason === "destroyed") return;
    teardown();
    options.onLost?.();
  });

  try {
    // Premultiplied so the page background shows through: the grid is a layer of
    // marks over the theme's surface, not a replacement for it.
    canvasSurface = surface(gpu, canvas, { dpr: [1, 2], alphaMode: "premultiplied" });

    // CSS pixels, not the surface's device pixels. The shader lays the grid out
    // in CSS px so that spacing and dot size are the same physical size on every
    // display; dpr only decides how finely that is sampled.
    const cssSize = (): [number, number] => [
      canvas.clientWidth || 1,
      canvas.clientHeight || 1,
    ];

    let clearing = packClearings(options.clearing);

    const grid = effect(gpu, gridShader, {
      label: "hero-grid",
      set: {
        params: {
          pointer: [0, 0],
          resolution: cssSize(),
          clearings: clearing,
          dark: options.dark ? 1 : 0,
          intensity: 0,
          pointerStrength: 0,
        },
      },
    });

    const activeSurface = canvasSurface;
    const frameClock = clock(gpu);

    let intensity = 0;
    let dark = options.dark ? 1 : 0;
    let targetDark = dark;
    let pointerStrength = 0;
    let targetPointerStrength = 0;
    const pointer = { x: 0, y: 0 };
    const pointerTarget = { x: 0, y: 0 };

    let paused = false;
    let stopping = false;

    /**
     * Renders only while something is actually moving.
     *
     * The grid has no idle animation by design, so a conventional always-on
     * frame loop would spend a GPU pass every 16ms redrawing an identical image
     * for as long as the page is open. Everything that can change the picture
     * routes through here instead.
     */
    const wake = () => {
      if (disposed || paused) return;
      stopping = false;
      if (loop) return;
      loop = frameLoop(gpu, (frame) => {
        const settled = advance();
        frame.pass(activeSurface, grid);
        if (settled) requestStop();
      });
    };

    const requestStop = () => {
      if (stopping) return;
      stopping = true;
      // Deferred rather than stopped from inside the loop's own callback, so the
      // frame that just settled is the one left on screen.
      queueMicrotask(() => {
        if (!stopping || disposed) return;
        loop?.stop();
        loop = undefined;
      });
    };

    /** Advances every easing one frame. Returns true once none of them is moving. */
    const advance = (): boolean => {
      const delta = Math.min(frameClock.deltaTime, MAX_DELTA);

      intensity = Math.min(1, intensity + delta / FADE_IN_SECONDS);
      dark = approach(dark, targetDark, delta / THEME_FADE_SECONDS);
      pointerStrength = approach(
        pointerStrength,
        targetPointerStrength,
        delta / POINTER_FADE_SECONDS,
      );

      const chase = Math.min(1, delta * POINTER_EASING);
      pointer.x += (pointerTarget.x - pointer.x) * chase;
      pointer.y += (pointerTarget.y - pointer.y) * chase;

      grid.set({
        params: {
          pointer: [pointer.x, pointer.y],
          resolution: cssSize(),
          clearings: clearing,
          dark,
          intensity,
          pointerStrength,
        },
      });

      // Sub-pixel pointer drift is invisible, so it does not count as movement.
      return (
        intensity >= 1 &&
        Math.abs(dark - targetDark) < SETTLED &&
        Math.abs(pointerStrength - targetPointerStrength) < SETTLED &&
        Math.hypot(pointerTarget.x - pointer.x, pointerTarget.y - pointer.y) < 0.5
      );
    };

    activeSurface.onResize(() => wake());

    // The pointer is kept in viewport coordinates and converted on use, because
    // the canvas moves under a stationary cursor whenever the page scrolls.
    let client: { x: number; y: number } | null = null;
    let lingerTimer: ReturnType<typeof setTimeout> | undefined;

    const retarget = () => {
      if (!client) return false;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      pointerTarget.x = client.x - rect.left;
      pointerTarget.y = client.y - rect.top;
      return true;
    };

    const arrive = (event: PointerEvent) => {
      clearTimeout(lingerTimer);
      client = { x: event.clientX, y: event.clientY };
      if (!retarget()) return;
      // If the bubble has fully faded, it reappears *at* the pointer. Chasing
      // from its last position instead would sweep a half-formed bubble across
      // the page -- from the top-left corner, on the very first move.
      if (pointerStrength < SETTLED) {
        pointer.x = pointerTarget.x;
        pointer.y = pointerTarget.y;
      }
      targetPointerStrength = 1;
      wake();
    };

    const depart = () => {
      clearTimeout(lingerTimer);
      targetPointerStrength = 0;
      wake();
    };

    const onPointerMove = (event: PointerEvent) => {
      // A finger only drives the grid while it is down; hover is mouse and pen.
      if (event.pointerType === "touch" && event.buttons === 0) return;
      arrive(event);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") arrive(event);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === "mouse") return;
      clearTimeout(lingerTimer);
      lingerTimer = setTimeout(depart, TOUCH_LINGER_MS);
    };

    // A lifted finger also "leaves" the document -- pointerleave follows every
    // touch pointerup -- which would cut the linger short. Only a mouse or pen
    // leaving the viewport means the visitor has gone.
    const onPointerLeave = (event: PointerEvent) => {
      if (event.pointerType !== "touch") depart();
    };

    const onScroll = () => {
      if (targetPointerStrength > 0 && retarget()) wake();
    };

    // On the window rather than the canvas: the canvas is pointer-events:none so
    // it never steals a click from the hero content sitting on top of it.
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    // pointercancel is what a touch gets when the browser takes it over for a
    // scroll, and it should let go the same way a lifted finger does.
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    // `pointerleave` on the document fires when the cursor leaves the viewport
    // entirely, which is the moment the bubble should relax rather than freeze
    // wherever it happened to be. Losing focus (alt-tab) is the same moment.
    document.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("blur", depart);

    wake();

    return {
      setDark(next) {
        targetDark = next ? 1 : 0;
        wake();
      },
      setPaused(next) {
        paused = next;
        if (next) {
          stopping = false;
          loop?.stop();
          loop = undefined;
        } else {
          wake();
        }
      },
      setClearing(next) {
        clearing = packClearings(next);
        wake();
      },
      dispose() {
        clearTimeout(lingerTimer);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
        window.removeEventListener("scroll", onScroll);
        document.removeEventListener("pointerleave", onPointerLeave);
        window.removeEventListener("blur", depart);
        teardown();
      },
    };
  } catch (error) {
    teardown();
    throw error;
  }
}
