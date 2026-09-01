import { clock, effect, frameLoop, init, surface } from "vgpu";
import type { FrameLoopHandle, Gpu, Surface } from "vgpu";
import gridShader from "@/shaders/grid.wgsl";

/** The hole the grid leaves for the hero content, in CSS px within the canvas. */
export interface Clearing {
  centerX: number;
  centerY: number;
  halfWidth: number;
  halfHeight: number;
}

export interface GridHandle {
  /** Crossfades the dots toward the dark or light palette. */
  setDark(dark: boolean): void;
  /** Stops and restarts rendering, e.g. when the hero scrolls out of view. */
  setPaused(paused: boolean): void;
  /** Re-measures where the grid must not draw. Safe to call on every resize. */
  setClearing(clearing: Clearing): void;
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
  options: { dark: boolean; clearing: Clearing },
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

    let clearing = options.clearing;

    const grid = effect(gpu, gridShader, {
      label: "hero-grid",
      set: {
        params: {
          pointer: [0, 0],
          resolution: cssSize(),
          clearCenter: [clearing.centerX, clearing.centerY],
          clearRadius: [clearing.halfWidth, clearing.halfHeight],
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
          clearCenter: [clearing.centerX, clearing.centerY],
          clearRadius: [clearing.halfWidth, clearing.halfHeight],
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

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      pointerTarget.x = event.clientX - rect.left;
      pointerTarget.y = event.clientY - rect.top;
      targetPointerStrength = 1;
      wake();
    };

    const onPointerGone = () => {
      targetPointerStrength = 0;
      wake();
    };

    // On the window rather than the canvas: the canvas is pointer-events:none so
    // it never steals a click from the hero content sitting on top of it.
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    // `pointerleave` on the document fires when the cursor leaves the viewport
    // entirely, which is the moment the bubble should relax rather than freeze
    // wherever it happened to be.
    document.addEventListener("pointerleave", onPointerGone);

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
        clearing = next;
        wake();
      },
      dispose() {
        window.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerleave", onPointerGone);
        teardown();
      },
    };
  } catch (error) {
    teardown();
    throw error;
  }
}
