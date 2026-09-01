// Headless preview and contrast gate for the hero aurora.
//
// `next build` never validates or renders WGSL, so this is how the shader gets
// judged: render it against a real device, read the pixels back, and measure what
// the alpha channel actually does. Tuning band thresholds by eye in a browser is
// how you end up with the muddy version.
//
//   node scripts/preview-aurora.mjs            # sweep every viewport, time and theme
//   node scripts/preview-aurora.mjs out.png    # one frame: stats + a PNG to look at
//
// The sweep is the gate; the single frame is for looking. `pnpm check:aurora`
// runs the sweep, and it fails the same way a broken shader would.
//
// Aspect is not cosmetic here: the curtains are compressed on y, so a square-ish
// preview shows tighter, curlier strands than the wide hero they render into. The
// sweep covers a spread of real viewports for that reason; PREVIEW_SIZE picks the
// one the single-frame mode uses.
//
//   PREVIEW_SIZE=1440x760 node scripts/preview-aurora.mjs wide.png 6 1
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

// The copy column is measured in CSS pixels, not as a fraction of the width. The
// description is the binding element -- it is the only small text over the field
// -- and Tailwind's max-w-xl pins it to 576px however wide the viewport gets. A
// percentage-of-width column would quietly test a 1400px band on an ultrawide and
// fail a shader that is fine. 640 leaves a little either side of the centered line.
const COPY_WIDTH = 640;

// Phone, tablet, laptop, desktop, and two ultrawides. Aspect ratio is what makes
// these distinct: the clearance ellipse is defined in aspect-corrected space, so
// how much of the copy it covers changes with the viewport, and the wide end is
// where it runs out first.
const VIEWPORTS = [
  [390, 844],
  [768, 900],
  [1440, 760],
  [1920, 820],
  [2560, 900],
  [3440, 1000],
];

// The field drifts, so a single instant proves nothing. Spread unevenly, so the
// samples do not land in step with any one octave.
const TIMES = [0, 6, 19, 47, 120];

const channel = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = ([r, g, b]) =>
  0.2126 * channel(r / 255) + 0.7152 * channel(g / 255) + 0.0722 * channel(b / 255);
const parseHex = (hex) => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * The .hero-backdrop mask, read out of globals.css rather than copied here.
 *
 * Contrast depends on the composite the visitor actually sees, and the mask is
 * half of it -- ignoring it would fail shaders that are fine on the page. Since
 * the canvas fills the masked element exactly, the gradient's percentages map
 * straight onto a rendered frame's uv.
 *
 * Parsed rather than duplicated because a hardcoded copy would drift silently,
 * and silently is the one way this check could be worse than no check at all.
 */
function readBackdropMask() {
  const css = readFileSync(new URL("../src/app/globals.css", import.meta.url), "utf8");
  const rule = /\.hero-backdrop\s*\{([^}]*)\}/.exec(css);
  const gradient =
    rule &&
    /mask-image:\s*radial-gradient\(\s*([\d.]+)%\s+([\d.]+)%\s+at\s+([\d.]+)%\s+([\d.]+)%\s*,\s*#000\s+0%\s*,\s*#000\s+([\d.]+)%\s*,\s*transparent\s+100%\s*\)/.exec(
      rule[1],
    );
  if (!gradient) {
    throw new Error(
      "Could not parse the .hero-backdrop mask from globals.css. It changed shape, and this " +
        "check cannot silently fall back to an unmasked frame -- update the pattern here to match.",
    );
  }
  const [radiusX, radiusY, centerX, centerY, solidTo] = gradient.slice(1, 6).map(Number);
  const solid = solidTo / 100;
  return (u, v) => {
    const d = Math.hypot(
      (u - centerX / 100) / (radiusX / 100),
      (v - centerY / 100) / (radiusY / 100),
    );
    return d <= solid ? 1 : Math.max(0, 1 - (d - solid) / (1 - solid));
  };
}

/** Worst text contrast anywhere the hero copy can sit, per foreground role. */
function measureContrast(pixels, width, height, dark, maskAt) {
  const theme = THEMES[dark];
  const surface = parseHex(theme.background);
  const half = Math.min(COPY_WIDTH, width) / 2;
  const start = Math.max(0, Math.round(width / 2 - half));
  const end = Math.min(width - 1, Math.round(width / 2 + half));

  const worst = {};
  for (const [role, hex] of Object.entries(theme.text)) {
    const ink = parseHex(hex);
    let lowest = Infinity;
    // Height is left unbounded, which is conservative: no text reaches the top or
    // bottom of the canvas, since it starts 8rem above the hero and runs to 150%
    // of its height.
    for (let y = 0; y < height; y++) {
      for (let x = start; x <= end; x++) {
        const i = (y * width + x) * 4;
        // The mask scales a premultiplied pixel wholesale -- color and alpha alike.
        const m = maskAt((x + 0.5) / width, (y + 0.5) / height);
        const alpha = (pixels[i + 3] / 255) * m;
        // Premultiplied color, so compositing over the surface is an add.
        const over = [0, 1, 2].map((c) => pixels[i + c] * m + surface[c] * (1 - alpha));
        const ratio = contrast(ink, over);
        if (ratio < lowest) lowest = ratio;
      }
    }
    worst[role] = Number(lowest.toFixed(2));
  }
  return worst;
}

/** How much of the canvas carries light, and how bright it gets. */
function measureAlpha(pixels) {
  const alphas = [];
  for (let i = 3; i < pixels.length; i += 4) alphas.push(pixels[i]);
  alphas.sort((a, b) => a - b);
  const at = (q) => alphas[Math.floor((alphas.length - 1) * q)];
  return {
    mean: Number((alphas.reduce((sum, v) => sum + v, 0) / alphas.length).toFixed(2)),
    p50: at(0.5),
    p90: at(0.9),
    p99: at(0.99),
    max: alphas.at(-1),
    // Share of the canvas carrying visible light at all.
    coverage: Number((alphas.filter((v) => v > 8).length / alphas.length).toFixed(3)),
  };
}

const outPath = process.argv[2];
const argTime = Number(process.argv[3] ?? 6);
const argDark = Number(process.argv[4] ?? 1);

const [WIDTH, HEIGHT] = (process.env.PREVIEW_SIZE ?? "640x420")
  .split("x")
  .map((n) => Number.parseInt(n, 10));
if (!Number.isInteger(WIDTH) || !Number.isInteger(HEIGHT) || WIDTH < 1 || HEIGHT < 1) {
  throw new Error(`PREVIEW_SIZE must look like 1440x760, got ${process.env.PREVIEW_SIZE}`);
}

const resolved = await resolveShader({
  entry: fileURLToPath(new URL("../src/shaders/aurora.wgsl", import.meta.url)),
});

const maskAt = readBackdropMask();
const gpu = await init();
const aurora = effect(gpu, resolved.wgsl, { label: "aurora-preview" });
const targets = new Map();

/** Renders one frame and reads it back. Targets are reused across the sweep. */
async function render(width, height, time, dark) {
  const key = `${width}x${height}`;
  if (!targets.has(key)) {
    targets.set(key, target(gpu, { size: [width, height], format: "rgba8unorm" }));
  }
  const colorTarget = targets.get(key);
  aurora.set({
    params: { pointer: [0, 0], time, dark, intensity: 1, aspect: width / height },
  });
  aurora.draw(colorTarget);
  return colorTarget.read();
}

try {
  if (outPath) {
    const pixels = await render(WIDTH, HEIGHT, argTime, argDark);
    console.log(
      JSON.stringify({
        size: `${WIDTH}x${HEIGHT}`,
        time: argTime,
        theme: THEMES[argDark].name,
        alpha: measureAlpha(pixels),
        contrast: measureContrast(pixels, WIDTH, HEIGHT, argDark, maskAt),
      }),
    );
    const png = new PNG({ width: WIDTH, height: HEIGHT });
    png.data.set(pixels);
    writeFileSync(outPath, PNG.sync.write(png));
    console.log("wrote", outPath);
  } else {
    const failures = [];
    let worstOverall = Infinity;

    for (const [width, height] of VIEWPORTS) {
      for (const time of TIMES) {
        for (const dark of [1, 0]) {
          const pixels = await render(width, height, time, dark);
          const ratios = measureContrast(pixels, width, height, dark, maskAt);
          for (const [role, ratio] of Object.entries(ratios)) {
            worstOverall = Math.min(worstOverall, ratio);
            if (ratio < AA_BODY) {
              failures.push(`${width}x${height} t=${time} ${THEMES[dark].name} ${role} ${ratio}:1`);
            }
          }
        }
      }
    }

    const total = VIEWPORTS.length * TIMES.length * 2;
    if (failures.length > 0) {
      console.error(
        `contrast: ${failures.length} of ${total} frames fall under the ${AA_BODY}:1 AA floor ` +
          "for body text over the hero copy.\n" +
          failures.map((line) => `  ${line}`).join("\n") +
          "\n\nLower copyPeak in src/shaders/aurora.wgsl, or widen the clearance ellipse.",
      );
      process.exitCode = 1;
    } else {
      console.log(
        `contrast: ${total} frames clear the ${AA_BODY}:1 AA floor over the hero copy ` +
          `(worst ${worstOverall.toFixed(2)}:1).`,
      );
    }
  }
} finally {
  gpu.dispose();
}
