// Headless preview harness for the hero aurora.
//
// `next build` never validates or renders WGSL, so this is how the shader gets
// judged: render it against a real device, read the pixels back, and print what
// the alpha channel actually does. Tuning band thresholds by eye in a browser
// is how you end up with the muddy version.
//
//   node scripts/preview-aurora.mjs            # stats only
//   node scripts/preview-aurora.mjs out.png    # stats + a PNG to look at
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";
import { resolveShader } from "@vgpu/wgsl/runtime";
import { effect, init, target } from "vgpu/node";
import { PNG } from "pngjs";

const WIDTH = 640;
const HEIGHT = 420;
const outPath = process.argv[2];
const time = Number(process.argv[3] ?? 6);
const dark = Number(process.argv[4] ?? 1);

const resolved = await resolveShader({
  entry: fileURLToPath(new URL("../src/shaders/aurora.wgsl", import.meta.url)),
});

const gpu = await init();
const colorTarget = target(gpu, { size: [WIDTH, HEIGHT], format: "rgba8unorm" });

effect(gpu, resolved.wgsl, {
  set: {
    params: { pointer: [0, 0], time, dark, intensity: 1, aspect: WIDTH / HEIGHT },
  },
}).draw(colorTarget);

const pixels = await colorTarget.read();

const alphas = [];
for (let i = 3; i < pixels.length; i += 4) alphas.push(pixels[i]);
alphas.sort((a, b) => a - b);

const at = (q) => alphas[Math.floor((alphas.length - 1) * q)];
const mean = alphas.reduce((sum, v) => sum + v, 0) / alphas.length;

console.log(
  JSON.stringify({
    time,
    dark,
    alpha: {
      mean: Number(mean.toFixed(2)),
      p50: at(0.5),
      p90: at(0.9),
      p99: at(0.99),
      max: alphas.at(-1),
      // Share of the canvas carrying visible light at all.
      coverage: Number((alphas.filter((v) => v > 8).length / alphas.length).toFixed(3)),
    },
  }),
);

if (outPath) {
  const png = new PNG({ width: WIDTH, height: HEIGHT });
  png.data.set(pixels);
  writeFileSync(outPath, PNG.sync.write(png));
  console.log("wrote", outPath);
}

gpu.dispose();
