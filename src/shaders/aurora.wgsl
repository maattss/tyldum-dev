// Ambient aurora backdrop for the hero.
//
// Three domain-warped simplex ribbons in the site's blues, output premultiplied so
// the canvas composites straight onto whatever the page background happens to be.
// That is what lets one shader serve both themes: `dark` crossfades the exposure
// rather than selecting a second palette.
//
// next build does not validate WGSL. Run `pnpm check:shaders` after editing.

import { fbmSimplex3d } from "@vgpu/wgsl-std/noise/simplex";
import { hash2 } from "@vgpu/wgsl-std/hash";

struct Params {
  // Smoothed pointer offset, roughly -1..1 across the hero. Zero until the
  // pointer first moves, so a touch-only visit never sees it jump.
  pointer: vec2f,
  // Seconds of *rendered* time. The host clamps its own delta, so a stall or a
  // pause never shows up as a jump in the field.
  time: f32,
  // 1.0 dark, 0.0 light. Crossfaded by the host over ~0.4s on a theme switch.
  dark: f32,
  // Master opacity, ramped 0 -> 1 on start so the first frame never pops.
  intensity: f32,
  // Surface width / height, so ribbons keep their shape on any viewport.
  aspect: f32,
}

@group(0) @binding(0) var<uniform> params: Params;

// The site's accent ramp: --primary, --ring, --chart-5. Written as plain
// normalized sRGB because the canvas format is non-srgb, so these land as the
// exact bytes the CSS tokens use.
const ACCENT_BLUE = vec3f(0.1686, 0.4980, 1.0000); // #2b7fff
const ACCENT_CYAN = vec3f(0.1843, 0.7255, 1.0000); // #2fb9ff
const ACCENT_PALE = vec3f(0.4980, 0.6667, 0.9882); // #7faafc

// One curtain of light. The warp pass is what turns concentric noise into
// something that reads as drifting rather than boiling: a low-frequency field
// displaces the sample point before the body is sampled from it.
fn ribbon(position: vec2f, t: f32, seed: f32, scale: f32) -> f32 {
  let warp = fbmSimplex3d(vec3f(position * scale * 0.6, t + seed), 3, 2.0, 0.5);
  let warped = position + vec2f(warp * 0.45, warp * 0.16);

  // Compressed on y so the curtains run wide across the hero instead of blobby.
  return fbmSimplex3d(vec3f(warped * vec2f(scale, scale * 2.4), t * 0.6 + seed), 3, 2.0, 0.55);
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  // Centered and aspect-corrected. uv.y is 0 at the top of the canvas.
  let centered = (uv - vec2f(0.5)) * vec2f(params.aspect, 1.0);
  let sample = centered - params.pointer * 0.05;
  let t = params.time * 0.06;

  let first = ribbon(sample + vec2f(0.00, 0.16), t, 0.0, 1.30);
  let second = ribbon(sample + vec2f(0.55, -0.02), t * 0.82, 4.3, 1.00);
  let third = ribbon(sample - vec2f(0.42, 0.20), t * 1.18, 9.1, 1.85);

  // fbm's nominal range is -1..1, but three octaves only reach about +/-0.79 in
  // practice (measured with scripts/preview-aurora.mjs), with a median near zero.
  // These edges are picked against that real distribution: thresholds set for the
  // nominal range leave all but the top percentile of pixels dark. Each ribbon is
  // cut slightly tighter than the last, so the first is a broad wash and the third
  // survives only as highlights.
  let firstBand = smoothstep(-0.30, 0.45, first);
  let secondBand = smoothstep(-0.18, 0.52, second);
  let thirdBand = smoothstep(-0.05, 0.60, third);

  var mass = firstBand * 0.45 + secondBand * 0.34 + thirdBand * 0.24;

  // Normalized, so the ribbons decide the *hue* and `mass` alone decides how much
  // light there is. Leaving the weights in the color as well attenuates twice and
  // turns the field muddy grey rather than luminous.
  let weightSum = max(firstBand + secondBand + thirdBand, 1.0e-4);
  let color =
    (ACCENT_BLUE * firstBand + ACCENT_CYAN * secondBand + ACCENT_PALE * thirdBand) / weightSum;

  // Superlinear lift on the densest part of each curtain. Raising the exposure
  // uniformly instead would wash the whole hero; this keeps the broad field as
  // faint as it needs to be behind text while letting the cores actually read as
  // light rather than as grey haze.
  mass += smoothstep(0.42, 0.95, mass) * 0.55;

  // The hero occupies the top of the page, so the field is brightest across the
  // top edge and is gone before it reaches anything below.
  mass *= smoothstep(1.0, 0.06, uv.y);
  mass *= smoothstep(1.15, 0.30, length(centered * vec2f(0.62, 1.25)));

  // Light theme gets under a third of the opacity: on #f7f9fd this has to stay
  // well under the contrast floor for the muted body text sitting on top of it.
  let alpha = mix(mass * 0.13, mass * 0.52, params.dark) * params.intensity;

  // A gradient this soft bands visibly at 8 bits. A sub-LSB dither breaks up the
  // steps and doubles as the fine grain; fract() keeps the seed precise no matter
  // how long the page has been open.
  let noise = hash2(uv * 480.0 + fract(params.time) * 37.0).x - 0.5;
  let alphaOut = clamp(alpha + noise * (1.2 / 255.0), 0.0, 1.0);
  let rgb = clamp(color, vec3f(0.0), vec3f(1.0)) * alphaOut + noise * (1.6 / 255.0);

  return vec4f(clamp(rgb, vec3f(0.0), vec3f(1.0)), alphaOut);
}
