import { clock, effect, frameLoop, init, surface } from "vgpu";
import type { FrameLoopHandle, Gpu, Surface } from "vgpu";
import auroraShader from "@/shaders/aurora.wgsl";

export interface AuroraHandle {
  /** Crossfades the field toward the dark or light exposure. */
  setDark(dark: boolean): void;
  /** Stops and restarts the render loop, e.g. when the hero scrolls out of view. */
  setPaused(paused: boolean): void;
  dispose(): void;
}

/** Seconds for the field to reach full opacity after the first frame. */
const FADE_IN_SECONDS = 1.2;
/** Seconds for a theme switch to cross the exposure over. */
const THEME_FADE_SECONDS = 0.4;
/**
 * Longest delta a single frame may advance the field. A backgrounded tab or a
 * long task hands back a delta measured in seconds; without this the aurora
 * teleports on return, which is far more noticeable than the dropped frames.
 */
const MAX_DELTA = 1 / 30;
/** How fast the pointer offset chases the cursor, per second. */
const POINTER_EASING = 3.5;

/**
 * Starts the aurora on `canvas`.
 *
 * WebGPU support and motion preferences are the caller's to check — this runs
 * unconditionally, so it stays a plain function worth testing on its own.
 */
export async function startAurora(
  canvas: HTMLCanvasElement,
  options: { dark: boolean },
): Promise<AuroraHandle> {
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
    // Premultiplied so the page background shows through: the shader is a layer
    // of light over the theme's surface, not a replacement for it.
    canvasSurface = surface(gpu, canvas, { dpr: [1, 2], alphaMode: "premultiplied" });

    const aspectOf = (target: Surface) => {
      const [width, height] = target.size;
      return height > 0 ? width / height : 1;
    };

    const aurora = effect(gpu, auroraShader, {
      label: "hero-aurora",
      set: {
        params: {
          pointer: [0, 0],
          time: 0,
          dark: options.dark ? 1 : 0,
          intensity: 0,
          aspect: aspectOf(canvasSurface),
        },
      },
    });

    const activeSurface = canvasSurface;
    activeSurface.onResize(() => {
      aurora.set({ params: { aspect: aspectOf(activeSurface) } });
    });

    let elapsed = 0;
    let intensity = 0;
    let dark = options.dark ? 1 : 0;
    let targetDark = dark;
    const pointer = { x: 0, y: 0 };
    const pointerTarget = { x: 0, y: 0 };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      pointerTarget.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerTarget.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    };

    // On the window rather than the canvas: the canvas is pointer-events:none so
    // it never steals a click from the hero content sitting on top of it.
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const frameClock = clock(gpu);

    const runFrame = () => {
      const delta = Math.min(frameClock.deltaTime, MAX_DELTA);
      elapsed += delta;

      intensity = Math.min(1, intensity + delta / FADE_IN_SECONDS);
      const themeStep = delta / THEME_FADE_SECONDS;
      dark += Math.max(-themeStep, Math.min(themeStep, targetDark - dark));

      const chase = Math.min(1, delta * POINTER_EASING);
      pointer.x += (pointerTarget.x - pointer.x) * chase;
      pointer.y += (pointerTarget.y - pointer.y) * chase;

      aurora.set({
        params: {
          pointer: [pointer.x, pointer.y],
          time: elapsed,
          dark,
          intensity,
        },
      });
    };

    const start = () => {
      if (disposed || loop) return;
      loop = frameLoop(gpu, (frame) => {
        runFrame();
        frame.pass(activeSurface, aurora);
      });
    };

    start();

    return {
      setDark(next) {
        targetDark = next ? 1 : 0;
      },
      setPaused(paused) {
        if (paused) {
          loop?.stop();
          loop = undefined;
        } else {
          start();
        }
      },
      dispose() {
        window.removeEventListener("pointermove", onPointerMove);
        teardown();
      },
    };
  } catch (error) {
    teardown();
    throw error;
  }
}
