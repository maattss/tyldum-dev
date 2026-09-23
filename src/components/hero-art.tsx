// The two "curtain" panels either side of the horizon. Everything here is
// generated at build time from a fixed seed, so the markup is identical on
// every render and ships as static SVG with no client code.

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** A clip-path for a panel whose inner edge looks torn rather than cut. */
export function tornEdge(side: "left" | "right", seed: number): string {
  const rand = rng(seed);
  const edge: string[] = [];
  for (let y = 0; y <= 100; y += 1.25) {
    const inset = r1(0.4 + rand() * 1.6);
    edge.push(side === "left" ? `${100 - inset}% ${y}%` : `${inset}% ${y}%`);
  }
  return side === "left"
    ? `polygon(0 0, ${edge.join(", ")}, 0 100%)`
    : `polygon(${edge.join(", ")}, 100% 100%, 100% 0)`;
}

/** A line with a little tremor in it, as if drawn by hand. */
function sketchLine(
  rand: () => number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  overshoot = 5,
): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const o1 = overshoot * rand();
  const o2 = overshoot * rand();
  const sx = x1 - ux * o1;
  const sy = y1 - uy * o1;
  const ex = x2 + ux * o2;
  const ey = y2 + uy * o2;
  const wobble = () => (rand() - 0.5) * 3;
  const mx = (sx + ex) / 2 - uy * wobble();
  const my = (sy + ey) / 2 + ux * wobble();
  return `M${r1(sx)} ${r1(sy)} Q${r1(mx)} ${r1(my)} ${r1(ex)} ${r1(ey)}`;
}

function sketchBox(
  rand: () => number,
  x: number,
  y: number,
  w: number,
  h: number,
): string {
  return [
    sketchLine(rand, x, y, x + w, y),
    sketchLine(rand, x + w, y, x + w, y + h),
    sketchLine(rand, x + w, y + h, x, y + h),
    sketchLine(rand, x, y + h, x, y),
  ].join(" ");
}

function arrow(
  rand: () => number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): string {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 9;
  const a1 = angle + Math.PI - 0.45;
  const a2 = angle + Math.PI + 0.45;
  return [
    sketchLine(rand, x1, y1, x2, y2, 2),
    `M${r1(x2 + Math.cos(a1) * head)} ${r1(y2 + Math.sin(a1) * head)} L${r1(x2)} ${r1(y2)} L${r1(x2 + Math.cos(a2) * head)} ${r1(y2 + Math.sin(a2) * head)}`,
  ].join(" ");
}

/** Left panel: an architecture sketch on ochre paper, over a sheet of
 *  charcoal strokes. */
export function SketchPanel() {
  const rand = rng(7);
  const boxes = [
    { x: 180, y: 110, w: 120, h: 64, label: "web" },
    { x: 60, y: 270, w: 120, h: 64, label: "api" },
    { x: 230, y: 300, w: 110, h: 56, label: "queue" },
  ];
  const ink = [
    ...boxes.map((b) => sketchBox(rand, b.x, b.y, b.w, b.h)),
    // A database cylinder under the api.
    sketchLine(rand, 70, 450, 70, 520, 2),
    sketchLine(rand, 170, 450, 170, 520, 2),
    "M70 450 C70 432 170 432 170 450 C170 468 70 468 70 450",
    "M70 520 C70 538 170 538 170 520",
    arrow(rand, 225, 178, 150, 262),
    arrow(rand, 185, 302, 226, 324),
    arrow(rand, 120, 338, 120, 428),
    // Pencil guide lines, the kind left over from laying out a drawing.
    sketchLine(rand, 330, 0, 334, 600, 0),
    sketchLine(rand, 20, 222, 380, 218, 0),
    sketchLine(rand, 40, 40, 44, 600, 0),
  ];
  const ticks = Array.from({ length: 9 }, (_, i) => {
    const y = 60 + i * 60;
    return sketchLine(rand, 324, y, 340, y + (rand() - 0.5) * 3, 1);
  });
  const strokes = Array.from({ length: 11 }, (_, i) => {
    const y = 700 + i * 28 + rand() * 8;
    const x = -20 + rand() * 60;
    const w = 180 + rand() * 220;
    const lift = 10 + rand() * 18;
    return {
      d: `M${r1(x)} ${r1(y)} Q${r1(x + w * 0.35)} ${r1(y - lift)} ${r1(x + w * 0.6)} ${r1(y)} T${r1(x + w)} ${r1(y - lift * 0.4)}`,
      width: r1(3 + rand() * 7),
    };
  });

  return (
    <svg
      viewBox="0 0 400 1000"
      preserveAspectRatio="xMaxYMid slice"
      className="h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="400" height="1000" fill="#e3b23c" />
      <path
        d="M0 640 L400 612 L400 1000 L0 1000 Z"
        fill="#d8ccb4"
      />
      <g fill="none" stroke="#2a241b" strokeLinecap="round">
        <path d={ink.join(" ")} strokeWidth="1.6" opacity="0.85" />
        <path d={ticks.join(" ")} strokeWidth="1.1" opacity="0.6" />
        {strokes.map((s, i) => (
          <path key={i} d={s.d} strokeWidth={s.width} opacity="0.82" />
        ))}
      </g>
      <g
        fill="#2a241b"
        fontFamily="var(--font-plex-mono), monospace"
        fontSize="15"
        opacity="0.8"
      >
        {boxes.map((b) => (
          <text key={b.label} x={b.x + 12} y={b.y + 26}>
            {b.label}
          </text>
        ))}
        <text x="84" y="496">db</text>
      </g>
    </svg>
  );
}

/** Right panel: ridgelines of a mountain range, drawn front to back so each
 *  ridge hides the ones behind it. Bergen has seven of these. */
export function RidgePanel() {
  const rand = rng(23);
  const peaks = Array.from({ length: 5 }, () => ({
    x: rand() * 400,
    h: 60 + rand() * 120,
    w: 40 + rand() * 70,
  }));
  const lines = 18;
  const ridges = Array.from({ length: lines }, (_, i) => {
    const base = 470 + i * 28;
    const scale = 0.35 + (i / lines) * 0.9;
    const points: string[] = [];
    for (let x = -10; x <= 410; x += 10) {
      let h = 0;
      for (const p of peaks) {
        h += p.h * Math.exp(-((x - p.x) ** 2) / (2 * p.w * p.w));
      }
      h = h * scale + (rand() - 0.5) * 6;
      points.push(`${x} ${r1(base - h)}`);
    }
    return `M${points.join(" L")} L410 1010 L-10 1010 Z`;
  });

  return (
    <svg
      viewBox="0 0 400 1000"
      preserveAspectRatio="xMinYMid slice"
      className="h-full w-full"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="ridge-ember" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.35" stopColor="#f4b26a" />
          <stop offset="0.7" stopColor="#d9582a" />
          <stop offset="1" stopColor="#8f2f16" />
        </linearGradient>
      </defs>
      <rect width="400" height="1000" fill="#100e0d" />
      <g fill="#100e0d" stroke="url(#ridge-ember)" strokeWidth="1.4" strokeLinejoin="round">
        {ridges.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}
