// Ambient aurora backdrop for the hero.
//
// Three domain-warped simplex curtains in the site's blues, output premultiplied
// so the canvas composites straight onto whatever the page background happens to
// be. That is what lets one shader serve both themes: `dark` crossfades the
// exposure rather than selecting a second palette.
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
  // Surface width / height, so curtains keep their shape on any viewport.
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
fn field(position: vec2f, t: f32, seed: f32, scale: f32) -> f32 {
  let warp = fbmSimplex3d(vec3f(position * scale * 0.6, t + seed), 3, 2.0, 0.5);
  let warped = position + vec2f(warp * 0.26, warp * 0.10);

  // Compressed on y so the curtains run wide across the hero instead of blobby.
  return fbmSimplex3d(vec3f(warped * vec2f(scale, scale * 3.4), t * 0.6 + seed), 2, 2.0, 0.5);
}

// A strand of light along one contour of the field, rather than everything above
// a threshold.
//
// This is the whole difference between curtains and smoke. `smoothstep(edge, n)`
// lights every pixel on the bright side of the edge, so the field fills in as a
// soft mass with no shape of its own; the eye reads it as haze. A narrow band
// around a single level set lights only where the field *crosses* that value,
// which is a line — it has direction and an edge, and it leaves most of the
// canvas dark.
//
// Squaring rolls the shoulders off, so each strand keeps a defined core instead
// of a linear ramp to nothing.
fn curtain(n: f32, center: f32, width: f32) -> f32 {
  let band = 1.0 - smoothstep(0.0, 1.0, abs(n - center) / width);
  return band * band;
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  // Centered and aspect-corrected. uv.y is 0 at the top of the canvas.
  let centered = (uv - vec2f(0.5)) * vec2f(params.aspect, 1.0);

  // A shared shear, so every curtain hangs off the same axis. Isotropic noise
  // has no preferred direction and reads as cloud however tightly it is banded;
  // the tilt is what makes three separate strands look like one system.
  let axis = vec2f(centered.x + centered.y * 0.42, centered.y);
  let sample = axis - params.pointer * 0.05;
  let t = params.time * 0.06;

  let first = field(sample + vec2f(0.00, 0.16), t, 0.0, 0.78);
  let second = field(sample + vec2f(0.55, -0.02), t * 0.82, 4.3, 0.62);
  let third = field(sample - vec2f(0.42, 0.20), t * 1.18, 9.1, 1.05);

  // fbm's nominal range is -1..1, but three octaves only reach about +/-0.79 in
  // practice (measured with scripts/preview-aurora.mjs), with a median near zero.
  // Centers are picked inside that real distribution and widths against its
  // density: a contour out at +/-0.7 is crossed by almost nothing.
  // Light theme gets noticeably wider bands.
  //
  // The two themes are not symmetric, however much one shader wants them to be.
  // Over #08090a the field adds light, so a narrow contour reads as a filament.
  // Over #f7f9fd it can only ever subtract, so the same contour reads as a pen
  // stroke -- and three of them crossing read as marbled paper, not as an
  // aurora. Widening the bands turns the strokes back into a wash, which is the
  // most a light surface will let this effect be.
  let soften = mix(1.75, 1.0, params.dark);
  let firstBand = curtain(first, 0.16, 0.26 * soften);
  let secondBand = curtain(second, -0.08, 0.20 * soften);
  let thirdBand = curtain(third, 0.24, 0.13 * soften);

  var mass = firstBand * 0.60 + secondBand * 0.40 + thirdBand * 0.22;

  // Normalized, so the curtains decide the *hue* and `mass` alone decides how
  // much light there is. Leaving the weights in the color as well attenuates
  // twice and turns the field muddy grey rather than luminous.
  let weightSum = max(firstBand + secondBand + thirdBand, 1.0e-4);
  let color =
    (ACCENT_BLUE * firstBand + ACCENT_CYAN * secondBand + ACCENT_PALE * thirdBand) / weightSum;

  // Superlinear lift on the cores. With banded strands this is what separates a
  // strand from its own falloff, rather than lifting a whole filled region.
  mass += smoothstep(0.30, 0.85, mass) * 0.45;

  // The hero occupies the top of the page, so the field is brightest across the
  // top edge and is gone before it reaches anything below.
  mass *= smoothstep(1.0, 0.06, uv.y);
  mass *= smoothstep(1.55, 0.62, length(centered * vec2f(0.62, 1.25)));

  // Clearance for the hero copy.
  //
  // The falloff above used to peak at the center, which put the brightest part
  // of the field directly under the smallest text on the page: measured against
  // the composited backdrop, --muted-foreground came out at 1.98:1 in dark mode,
  // against a 4.5:1 floor.
  //
  // The fix is a ceiling on opacity rather than another multiply into `mass`.
  // Attenuating is what produced the muddy field this shader started as, and it
  // also cannot actually guarantee anything: a bright enough core still clips to
  // opaque after any finite scale. Capping the exposure does guarantee it, and
  // it costs the curtains nothing outside the column.
  //
  // It is the better composition either way. Curtains running through a headline
  // read as a busy background; the same curtains parting around it read as a
  // frame.
  //
  // The ellipse covers the whole content stack rather than one line of it. The
  // canvas starts 8rem above the hero and runs 150% of its height, which puts
  // the avatar, headline, tagline and description between roughly 0.18 and 0.73
  // of uv.y. A tighter well would leave the guarantee depending on exactly where
  // each line lands at each breakpoint, which is not something a shader can know.
  let copy = length((centered - vec2f(0.0, 0.04)) * vec2f(0.70, 1.12));
  let clearance = smoothstep(0.40, 1.10, copy);

  // Peak opacity over the copy column, one per theme. These are not taste: they
  // are the largest values at which --muted-foreground still clears 4.5:1 once
  // the field is composited onto --background, solved against the brightest
  // color the palette can produce and confirmed by measuring the rendered
  // frame. Raising either one is a contrast regression, so re-measure before
  // touching them.
  let copyPeak = mix(0.22, 0.25, params.dark);

  // Away from the copy there is nothing to stay legible against, so the field
  // opens up to its full exposure. Light theme runs at roughly half of dark:
  // banding the curtains is what makes even that workable, since the lit share
  // of the canvas is small enough to carry real color without tinting the hero.
  let openPeak = mix(0.34, 0.68, params.dark);

  // Clamped before the exposure, so a core that overshoots the lift saturates to
  // the theme's peak rather than to an opaque pixel.
  let alpha = clamp(mass, 0.0, 1.0) * mix(copyPeak, openPeak, clearance) * params.intensity;

  // A gradient this soft bands visibly at 8 bits. A sub-LSB dither breaks up the
  // steps and doubles as the fine grain; fract() keeps the seed precise no matter
  // how long the page has been open.
  let noise = hash2(uv * 480.0 + fract(params.time) * 37.0).x - 0.5;
  let alphaOut = clamp(alpha + noise * (1.2 / 255.0), 0.0, 1.0);
  let rgb = clamp(color, vec3f(0.0), vec3f(1.0)) * alphaOut + noise * (1.6 / 255.0);

  return vec4f(clamp(rgb, vec3f(0.0), vec3f(1.0)), alphaOut);
}
