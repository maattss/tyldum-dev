// Headless preview and legibility gate for the hero dot grid.
//
// `next build` never validates or renders WGSL, so this is how the shader gets
// judged: render it against a real device and read the pixels back.
//
//   node scripts/preview-backdrop.mjs                    # sweep: the gate
//   node scripts/preview-backdrop.mjs out.png            # one frame to look at
//   node scripts/preview-backdrop.mjs out.png 1 900 260  # ...dark, pointer at 900,260
//
// What the sweep asserts is the *mechanism*, not a tuned constant:
//
//   1. The grid draws nothing at all inside the hero's content box. In the
//      browser that box is measured off the real elements, so the numbers here
//      only stand in for its shape -- but "the clearing clears" has to hold for
//      any box, and that is what is checked.
//   2. Dots are actually visible outside it, at every viewport. A clearing that
//      swallowed the whole canvas would satisfy (1) perfectly.
//   3. Body text clears the AA contrast floor in a guard band just outside the
//      content box -- the strip where a slightly mis-measured box would leave a
//      line of text exposed. NOT across the whole canvas: no text exists out
//      there, and requiring AA of every pixel would forbid the lit bubble that
//      is the entire point of the effect.
//
// Dots behind small text are worse than a wash -- they add local contrast at
// exactly the frequency that makes type hard to read -- so (1) is the property
// that matters, and it is absolute rather than a threshold.
import { fileURLToPath } from "node:url";
import { readFileSync, writeFileSync } from "node:fs";
import { resolveShader } from "@vgpu/wgsl/runtime";
import { effect, init, target } from "vgpu/node";
import { PNG } from "pngjs";

const THEMES = {
  1: { name: "dark", background: "#08090a", text: { foreground: "#f4f7ff", muted: "#94a0b6" } },
  0: { name: "light", background: "#f7f9fd", text: { foreground: "#0f1523", muted: "#4b5a72" } },
};

// WCAG 1.4.3 AA for body text. The hero's description is text-sm, so the large
// text allowance does not apply to the element that matters most here.
const AA_BODY = 4.5;

// How far outside the content box the AA floor is still enforced, CSS px. This
// is the margin for error on the clearing measurement, not a claim about where
// text is.
const GUARD_BAND = 56;

// Share of the canvas outside the clearing that must carry a visible dot. The
// grid is sparse by design -- dots at 26px spacing cover a few percent of the
// area -- so this only has to catch "the effect vanished", not police density.
const MIN_COVERAGE = 0.004;

// The hero's content box, as the browser would measure it. Width is max-w-xl
// (576px), which is the widest of the three blocks; height is the avatar, the
// text stack and the social row plus their gaps. The component adds its own
// padding on top of this, so the sweep is testing the smaller, harder box.
const CONTENT_WIDTH = 576;
const CONTENT_HEIGHT = 500;

// `.hero-backdrop` starts 8rem above the hero and runs to 150% of its height, so
// a viewport entry is (width, hero height) and the canvas is derived from it.
const HERO_OFFSET = 128;
const CANVAS_SCALE = 1.5;

const VIEWPORTS = [
  [390, 720],
  [768, 800],
  [1440, 760],
  [1920, 820],
  [2560, 900],
  [3440, 1000],
];

const channel = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]) =>
  0.2126 * channel(r / 255) + 0.7152 * channel(g / 255) + 0.0722 * channel(b / 255);
const parseHex = (hex) => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * The padding the component adds around the measured content before handing the
 * box to the shader, read from the component rather than restated here.
 *
 * Modelling this matters: the guard band below is only meaningful as a margin of
 * safety if the sweep clears the same box the browser does. Passing the raw
 * content box instead would put the band in the one strip the shader was never
 * asked to protect, and then demand AA of it.
 */
function readClearPadding() {
  const source = readFileSync(
    new URL("../src/components/hero-backdrop.tsx", import.meta.url),
    "utf8",
  );
  const x = /const CLEAR_PADDING_X = (\d+)/.exec(source);
  const y = /const CLEAR_PADDING_Y = (\d+)/.exec(source);
  if (!x || !y) {
    throw new Error(
      "Could not read CLEAR_PADDING_X/Y from hero-backdrop.tsx. They moved or were renamed, and " +
        "guessing them would make this gate quietly meaningless -- update the pattern here.",
    );
  }
  return [Number(x[1]), Number(y[1])];
}

const CLEAR_PADDING = readClearPadding();

/** Canvas geometry and the content box within it, all in CSS px. */
function layout(width, heroHeight) {
  const height = Math.round(heroHeight * CANVAS_SCALE);
  // What the copy occupies. The assertions are stated against this.
  const half = [Math.min(CONTENT_WIDTH, width * 0.9) / 2, CONTENT_HEIGHT / 2];
  return {
    width,
    height,
    // The hero sits HERO_OFFSET below the top of the canvas, so its middle is
    // that plus half its own height.
    center: [width / 2, HERO_OFFSET + heroHeight / 2],
    half,
    // What the shader is actually given, exactly as the component computes it.
    clearHalf: [half[0] + CLEAR_PADDING[0], half[1] + CLEAR_PADDING[1]],
  };
}

/** Chebyshev-style overshoot past the content box: <= 0 inside, px outside. */
function beyondContent(x, y, { center, half }) {
  return Math.max(
    Math.abs(x + 0.5 - center[0]) - half[0],
    Math.abs(y + 0.5 - center[1]) - half[1],
  );
}

function inspect(pixels, geometry, dark) {
  const { width, height } = geometry;
  const theme = THEMES[dark];
  const surface = parseHex(theme.background);
  const ink = Object.fromEntries(
    Object.entries(theme.text).map(([role, hex]) => [role, parseHex(hex)]),
  );

  let insideMaxAlpha = 0;
  let outsideLit = 0;
  let outsideTotal = 0;
  const worst = Object.fromEntries(Object.keys(ink).map((role) => [role, Infinity]));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const alpha = pixels[i + 3];

      const beyond = beyondContent(x, y, geometry);
      if (beyond <= 0) {
        if (alpha > insideMaxAlpha) insideMaxAlpha = alpha;
        continue;
      }

      outsideTotal++;
      if (alpha > 8) outsideLit++;
      if (alpha === 0 || beyond > GUARD_BAND) continue;

      // Premultiplied color, so compositing over the surface is an add. The CSS
      // mask is not applied: it only ever reduces alpha, so this is an upper
      // bound on how loud the grid can be.
      const over = [0, 1, 2].map((c) => pixels[i + c] + surface[c] * (1 - alpha / 255));
      for (const [role, color] of Object.entries(ink)) {
        const ratio = contrast(color, over);
        if (ratio < worst[role]) worst[role] = ratio;
      }
    }
  }

  for (const role of Object.keys(worst)) {
    if (!Number.isFinite(worst[role])) worst[role] = null;
    else worst[role] = Number(worst[role].toFixed(2));
  }

  return {
    insideMaxAlpha,
    coverage: Number((outsideLit / Math.max(outsideTotal, 1)).toFixed(4)),
    contrast: worst,
  };
}

const outPath = process.argv[2];
const argDark = Number(process.argv[3] ?? 1);
const argPointerX = process.argv[4] === undefined ? null : Number(process.argv[4]);
const argPointerY = process.argv[5] === undefined ? null : Number(process.argv[5]);

const [WIDTH, HERO] = (process.env.PREVIEW_SIZE ?? "1440x760")
  .split("x")
  .map((n) => Number.parseInt(n, 10));
if (!Number.isInteger(WIDTH) || !Number.isInteger(HERO) || WIDTH < 1 || HERO < 1) {
  throw new Error(`PREVIEW_SIZE must look like 1440x760, got ${process.env.PREVIEW_SIZE}`);
}

const resolved = await resolveShader({
  entry: fileURLToPath(new URL("../src/shaders/grid.wgsl", import.meta.url)),
});

const gpu = await init();
const grid = effect(gpu, resolved.wgsl, { label: "grid-preview" });
const targets = new Map();

async function render(geometry, dark, pointer, pointerStrength) {
  const { width, height, center, clearHalf } = geometry;
  const key = `${width}x${height}`;
  if (!targets.has(key)) {
    targets.set(key, target(gpu, { size: [width, height], format: "rgba8unorm" }));
  }
  const colorTarget = targets.get(key);
  grid.set({
    params: {
      pointer,
      resolution: [width, height],
      clearCenter: center,
      clearRadius: clearHalf,
      dark,
      intensity: 1,
      pointerStrength,
    },
  });
  grid.draw(colorTarget);
  return colorTarget.read();
}

try {
  if (outPath) {
    const geometry = layout(WIDTH, HERO);
    // Default the pointer to the left of the content, where there are dots to
    // deform -- putting it in the middle would hide the bubble in the clearing.
    const pointer =
      argPointerX === null
        ? [geometry.width * 0.22, geometry.center[1]]
        : [argPointerX, argPointerY ?? geometry.center[1]];

    const pixels = await render(geometry, argDark, pointer, 1);
    console.log(
      JSON.stringify({
        canvas: `${geometry.width}x${geometry.height}`,
        theme: THEMES[argDark].name,
        pointer,
        ...inspect(pixels, geometry, argDark),
      }),
    );
    const png = new PNG({ width: geometry.width, height: geometry.height });
    png.data.set(pixels);
    writeFileSync(outPath, PNG.sync.write(png));
    console.log("wrote", outPath);
  } else {
    const failures = [];
    let frames = 0;
    let worstContrast = Infinity;
    let leanestCoverage = Infinity;

    for (const [width, heroHeight] of VIEWPORTS) {
      const geometry = layout(width, heroHeight);
      // Resting, and with the pointer pressed against the clearing where the
      // displaced dots come closest to the copy.
      const probes = [
        ["resting", [0, 0], 0],
        ["pointer at the copy", geometry.center, 1],
        // Hard against each edge of the clearing: this is where a lit bubble
        // comes closest to the copy, so it is what the guard band is sized for.
        ["pointer left of the copy", [geometry.center[0] - geometry.clearHalf[0], geometry.center[1]], 1],
        ["pointer above the copy", [geometry.center[0], geometry.center[1] - geometry.clearHalf[1]], 1],
        // Out in the open, where the bubble is unattenuated by the clearing.
        // Guards coverage and the shape of the effect, not contrast.
        ["pointer in the open", [width * 0.18, geometry.center[1]], 1],
      ];

      for (const [label, pointer, strength] of probes) {
        for (const dark of [1, 0]) {
          const pixels = await render(geometry, dark, pointer, strength);
          const { insideMaxAlpha, coverage, contrast: ratios } = inspect(pixels, geometry, dark);
          const where = `${width}x${heroHeight} ${THEMES[dark].name} (${label})`;
          frames++;

          if (insideMaxAlpha > 0) {
            failures.push(`${where}: grid draws over the copy, alpha ${insideMaxAlpha}/255`);
          }
          leanestCoverage = Math.min(leanestCoverage, coverage);
          if (coverage < MIN_COVERAGE) {
            failures.push(`${where}: grid is invisible outside the copy, coverage ${coverage}`);
          }
          for (const [role, ratio] of Object.entries(ratios)) {
            if (ratio === null) continue;
            worstContrast = Math.min(worstContrast, ratio);
            if (ratio < AA_BODY) {
              failures.push(`${where}: ${role} ${ratio}:1 over the grid`);
            }
          }
        }
      }
    }

    if (failures.length > 0) {
      console.error(
        `hero grid: ${failures.length} problem(s) across ${frames} frames.\n` +
          failures.map((line) => `  ${line}`).join("\n"),
      );
      process.exitCode = 1;
    } else {
      console.log(
        `hero grid: ${frames} frames clear the copy entirely, stay visible around it ` +
          `(leanest coverage ${leanestCoverage}), and hold ${worstContrast.toFixed(2)}:1 ` +
          `against the ${AA_BODY}:1 AA floor within ${GUARD_BAND}px of the copy.`,
      );
    }
  }
} finally {
  gpu.dispose();
}
