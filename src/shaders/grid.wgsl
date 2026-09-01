// Interactive dot grid behind the page.
//
// At rest it is a quiet lattice -- deliberately close to the noise floor, since
// it covers the whole page and any more than that reads as busy wallpaper.
//
// Under the cursor it becomes something else: dots brighten, swell, push
// outward, and *link up* into a mesh. The lines are the point. A lattice that
// only changes brightness reads as a lighting effect; one that draws its own
// edges reads as structure the page had all along and the cursor revealed.
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
const SPACING = 34.0;
// Dot radius, CSS px, before the pointer scales it.
const DOT_RADIUS = 1.25;
// How far the pointer pushes a dot at the very center of its influence.
const PUSH = 30.0;
// Radius of the pointer's influence, CSS px. Generous: the mesh needs enough
// dots inside it to read as a structure rather than as a few stray lines.
const REACH = 250.0;
// Half-width of a mesh line, CSS px. Thin enough to read as drawing rather than
// glow. Wider on light, where a line subtracts from the surface and loses more
// of itself to antialiasing than one adding to a dark surface does.
const LINK_WIDTH_DARK = 0.6;
const LINK_WIDTH_LIGHT = 0.85;
// Cells searched either side of the fragment's own. A dot can be pushed most of
// a cell from its origin and a link spans a whole cell, so two is the working
// minimum; the failure looks like lines and dots winking out along the rim.
const SEARCH = 2;
const SEARCH_SPAN = 5; // SEARCH * 2 + 1
const SEARCH_CELLS = 25; // SEARCH_SPAN * SEARCH_SPAN
// How far past the content box the grid takes to come back, CSS px.
const CLEAR_FEATHER = 90.0;
// Corner rounding on the clearing. A text block is a rounded rectangle, not an
// ellipse: an ellipse sized to contain the same box would clear far more of the
// canvas than the copy actually occupies.
const CLEAR_CORNER = 32.0;

// The accent for dots and links inside the pointer's reach.
//
// Different tokens per theme, not the same one at two exposures. Dark uses
// --ring (#4ea7fc), which glows against #08090a. Light uses --primary
// (#2b7fff): --ring there is a bright cyan with barely any contrast against a
// near-white page, and thin lines drawn in it disappear at normal viewing size
// however high the alpha goes.
const ACCENT_DARK = vec3f(0.3059, 0.6549, 0.9882); // #4ea7fc, --ring
const ACCENT_LIGHT = vec3f(0.1686, 0.4980, 1.0000); // #2b7fff, --primary
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

// Distance from `point` to the segment `a`--`b`.
fn segmentDistance(point: vec2f, a: vec2f, b: vec2f) -> f32 {
  let pa = point - a;
  let ba = b - a;
  let t = clamp(dot(pa, ba) / max(dot(ba, ba), 1.0e-4), 0.0, 1.0);
  return length(pa - ba * t);
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

  let resting = mix(RESTING_LIGHT, RESTING_DARK, params.dark);
  let accent = mix(ACCENT_LIGHT, ACCENT_DARK, params.dark);
  let restingAlpha = mix(0.13, 0.22, params.dark);
  let excitedAlpha = mix(0.80, 0.95, params.dark);

  let cell = floor(position / SPACING);

  // Away from the pointer nothing is displaced and nothing links up, so the
  // nearest dot is the one in this fragment's own cell and there is no mesh to
  // draw. That is the overwhelming majority of the canvas, and skipping the
  // neighbourhood search for it is what keeps a full-page grid cheap.
  if (distance(position, params.pointer) > REACH + f32(SEARCH) * SPACING) {
    let origin = (cell + vec2f(0.5)) * SPACING;
    let mask =
      1.0 - smoothstep(DOT_RADIUS - 0.5, DOT_RADIUS + 0.5, distance(position, origin));
    if (mask <= 0.0) {
      return vec4f(0.0);
    }
    let quiet = mask * restingAlpha * clearing * params.intensity;
    return vec4f(resting * quiet, quiet);
  }

  // Inside the pointer's reach the dots move, so positions are resolved once and
  // reused: the mesh needs each dot's displaced position twice over, and
  // recomputing the warp per link costs more than the array does.
  var dots: array<vec2f, SEARCH_CELLS>;
  var weights: array<f32, SEARCH_CELLS>;
  for (var j = 0; j < SEARCH_SPAN; j++) {
    for (var i = 0; i < SEARCH_SPAN; i++) {
      let origin =
        (cell + vec2f(f32(i - SEARCH), f32(j - SEARCH)) + vec2f(0.5)) * SPACING;
      let weight = influence(origin);
      dots[j * SEARCH_SPAN + i] = displace(origin, weight);
      weights[j * SEARCH_SPAN + i] = weight;
    }
  }

  var coverage = 0.0;
  var lit = 0.0;
  for (var k = 0; k < SEARCH_CELLS; k++) {
    let weight = weights[k];
    // Dots swell as they are pushed, so the rim of the bubble does not read as a
    // ring of stragglers left behind by the ones that moved.
    let radius = DOT_RADIUS * (1.0 + weight * 1.3);
    // A 1px feather is the whole antialiasing story: the grid renders at device
    // resolution, so this stays crisp on a 2x display.
    let mask = 1.0 - smoothstep(radius - 0.5, radius + 0.5, distance(position, dots[k]));
    coverage = max(coverage, mask);
    lit = max(lit, mask * weight);
  }

  // The mesh. Each dot links to its right and lower neighbour, which covers every
  // edge in the lattice exactly once across the whole grid.
  //
  // A link is only as strong as its weaker end, so the mesh fades out at the rim
  // of the bubble instead of ending on a hard boundary of half-drawn lines.
  var mesh = 0.0;
  let linkWidth = mix(LINK_WIDTH_LIGHT, LINK_WIDTH_DARK, params.dark);
  for (var j = 0; j < SEARCH_SPAN; j++) {
    for (var i = 0; i < SEARCH_SPAN; i++) {
      let k = j * SEARCH_SPAN + i;
      if (i + 1 < SEARCH_SPAN) {
        let strength = min(weights[k], weights[k + 1]);
        if (strength > 0.01) {
          let d = segmentDistance(position, dots[k], dots[k + 1]);
          mesh = max(mesh, (1.0 - smoothstep(linkWidth, linkWidth + 1.0, d)) * strength);
        }
      }
      if (j + 1 < SEARCH_SPAN) {
        let below = k + SEARCH_SPAN;
        let strength = min(weights[k], weights[below]);
        if (strength > 0.01) {
          let d = segmentDistance(position, dots[k], dots[below]);
          mesh = max(mesh, (1.0 - smoothstep(linkWidth, linkWidth + 1.0, d)) * strength);
        }
      }
    }
  }

  if (coverage <= 0.0 && mesh <= 0.0) {
    return vec4f(0.0);
  }

  // `lit` is already scaled by coverage, so normalizing by it recovers the dot's
  // own influence and keeps the color from darkening at the dot's feathered
  // edge. Attenuating both color and alpha is the classic way to end up with a
  // muddy field instead of a bright one.
  let excitement = select(0.0, lit / coverage, coverage > 0.0);
  let dotAlpha = coverage * mix(restingAlpha, excitedAlpha, excitement);

  // Links run dimmer than the dots they join: at full strength they would read as
  // a wireframe drawn over the page rather than as something the dots are doing.
  // Less dimming on light, where thin lines subtract from a near-white surface
  // instead of adding to a near-black one and lose more to the background.
  let meshAlpha = mesh * excitedAlpha * mix(0.72, 0.55, params.dark);

  // Whichever is brighter, rather than summed -- a dot sitting on the end of two
  // links should not stack to opaque.
  let ink = max(dotAlpha, meshAlpha);
  let colorMix = max(excitement, mesh);
  let color = mix(resting, accent, colorMix);
  let alpha = ink * clearing * params.intensity;

  // Premultiplied, so the canvas composites straight onto the page background.
  return vec4f(color * alpha, alpha);
}
