// Interactive dot grid behind the hero.
//
// A precise lattice of dots that parts around the cursor: dots inside the
// pointer's radius are pushed outward and lit, leaving a clean bubble that
// tracks the pointer and settles back the moment it stops.
//
// Everything here is measured in CSS pixels rather than uv, because the point of
// the effect is that it reads as a fixed technical grid. Spacing and dot size
// that scale with the viewport read as a stretched texture instead.
//
// The host renders on demand -- there is no idle animation and no time uniform.
// See src/lib/gpu/grid.ts.
//
// next build does not validate WGSL. Run `pnpm check:shaders` after editing.

struct Params {
  // Pointer position in CSS px within the canvas. Meaningless until
  // `pointerStrength` rises above zero.
  pointer: vec2f,
  // Canvas size in CSS px. Not device px: the grid is a CSS-pixel construct, and
  // dpr only decides how finely it is sampled.
  resolution: vec2f,
  // Center of the clearing, CSS px. Measured off the real hero content by the
  // host, so it needs no agreement with any layout constant here.
  clearCenter: vec2f,
  // Half-extents of the clearing, CSS px. The content box itself; the feather
  // below is what turns it into a soft edge.
  clearRadius: vec2f,
  // 1.0 dark, 0.0 light. Crossfaded by the host over ~0.4s on a theme switch.
  dark: f32,
  // Master opacity, ramped 0 -> 1 on start so the first frame never pops.
  intensity: f32,
  // 0 until the pointer has actually moved over the page, then eased to 1. A
  // touch-only visit never sees the grid deform, and it never starts deformed
  // around a pointer that happens to default to the origin.
  pointerStrength: f32,
}

@group(0) @binding(0) var<uniform> params: Params;

// Distance between dots, CSS px. Wide enough to read as a grid rather than a
// texture, tight enough that the bubble contains a useful number of dots.
const SPACING = 26.0;
// Dot radius, CSS px, before the pointer scales it.
const DOT_RADIUS = 1.3;
// How far the pointer pushes a dot at the very center of its influence.
const PUSH = 20.0;
// Radius of the pointer's influence, CSS px.
const REACH = 190.0;
// How far past the content box the grid takes to come back, CSS px.
const CLEAR_FEATHER = 90.0;
// Corner rounding on the clearing. A text block is a rounded rectangle, not an
// ellipse: an ellipse sized to contain the same box would clear far more of the
// canvas than the copy actually occupies.
const CLEAR_CORNER = 32.0;

// The site's accent, for dots inside the pointer's reach: --ring in each theme.
const ACCENT_DARK = vec3f(0.3059, 0.6549, 0.9882); // #4ea7fc
const ACCENT_LIGHT = vec3f(0.1843, 0.7255, 1.0000); // #2fb9ff
// Resting dots, near the body text color but far below its weight.
const RESTING_DARK = vec3f(0.5804, 0.6275, 0.7137); // #94a0b6
const RESTING_LIGHT = vec3f(0.2941, 0.3529, 0.4471); // #4b5a72

// Signed distance from `position` to the rounded content box: negative inside,
// zero on the edge, positive outside.
fn contentDistance(position: vec2f) -> f32 {
  let q =
    abs(position - params.clearCenter) - params.clearRadius + vec2f(CLEAR_CORNER);
  return length(max(q, vec2f(0.0))) + min(max(q.x, q.y), 0.0) - CLEAR_CORNER;
}

// How much of the pointer's influence a dot at `origin` feels: 1 under the
// pointer, 0 at REACH and beyond. Squared so the bubble has a defined edge
// rather than a linear ramp across its whole radius.
fn influence(origin: vec2f) -> f32 {
  let falloff = smoothstep(REACH, 0.0, distance(origin, params.pointer));
  return falloff * falloff * params.pointerStrength;
}

// Where a dot actually sits once the pointer has pushed it. Radially outward, so
// the grid opens a clean circle instead of shearing.
fn displace(origin: vec2f, weight: f32) -> vec2f {
  let away = origin - params.pointer;
  let reach = length(away);
  if (reach < 1.0e-3) {
    return origin;
  }
  return origin + (away / reach) * weight * PUSH;
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let position = uv * params.resolution;

  // The clearing.
  //
  // Dots behind text are worse than a wash: they add local contrast at exactly
  // the frequency that makes small type hard to read. So the grid does not dim
  // behind the hero content, it stops -- and because the host measures the real
  // content box, the hole is the right size at every breakpoint without this
  // shader knowing anything about the layout.
  let clearing = smoothstep(0.0, CLEAR_FEATHER, contentDistance(position));
  if (clearing <= 0.0) {
    return vec4f(0.0);
  }

  // A dot can be pushed most of a cell away from where it started, so the dot
  // nearest this fragment is not necessarily the one whose cell it sits in. Five
  // cells across covers PUSH comfortably; three does not, and the failure looks
  // like dots winking out along the rim of the bubble.
  let cell = floor(position / SPACING);
  var coverage = 0.0;
  var lit = 0.0;

  for (var dy = -2; dy <= 2; dy++) {
    for (var dx = -2; dx <= 2; dx++) {
      let origin = (cell + vec2f(f32(dx), f32(dy)) + vec2f(0.5)) * SPACING;
      let weight = influence(origin);
      let center = displace(origin, weight);

      // Dots grow a little as they are pushed, which keeps the rim of the bubble
      // from reading as a ring of stragglers.
      let radius = DOT_RADIUS * (1.0 + weight * 0.75);
      // A 1px feather is the whole antialiasing story: the grid is rendered at
      // device resolution, so this stays crisp on a 2x display.
      let mask = 1.0 - smoothstep(radius - 0.5, radius + 0.5, distance(position, center));

      coverage = max(coverage, mask);
      lit = max(lit, mask * weight);
    }
  }

  if (coverage <= 0.0) {
    return vec4f(0.0);
  }

  let resting = mix(RESTING_LIGHT, RESTING_DARK, params.dark);
  let accent = mix(ACCENT_LIGHT, ACCENT_DARK, params.dark);
  // `lit` is already scaled by coverage, so normalizing by it recovers the dot's
  // own influence and keeps the color from darkening at the dot's feathered
  // edge. Attenuating both color and alpha is the classic way to end up with a
  // muddy field instead of a bright one.
  let excitement = lit / coverage;
  let color = mix(resting, accent, excitement);

  // Resting dots sit just above the noise floor; the ones under the pointer come
  // up far enough to read as a highlight. Light theme runs quieter throughout,
  // since dots subtract from a near-white surface rather than adding to a dark
  // one, and read heavier for the same alpha.
  let restingAlpha = mix(0.22, 0.36, params.dark);
  let excitedAlpha = mix(0.60, 0.90, params.dark);
  let alpha =
    coverage * mix(restingAlpha, excitedAlpha, excitement) * clearing * params.intensity;

  // Premultiplied, so the canvas composites straight onto the page background.
  return vec4f(color * alpha, alpha);
}
