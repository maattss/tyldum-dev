/**
 * Confetti effect utility
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vrotation: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

const colors = [
  "#FF1744",
  "#F50057",
  "#D500F9",
  "#651FFF",
  "#2979F3",
  "#00B0FF",
  "#00E5FF",
  "#1DE9B6",
  "#00E676",
  "#76FF03",
  "#FFEA00",
  "#FFC400",
  "#FF9100",
  "#FF3D00",
];

export function triggerConfetti(element: HTMLElement = document.body): void {
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const particles: Particle[] = [];

  // Create confetti particles
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -10,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * 5 + 2,
      rotation: Math.random() * Math.PI * 2,
      vrotation: (Math.random() - 0.5) * 0.2,
      life: 1,
      maxLife: Math.random() * 2 + 2,
      size: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
    });
  }

  function animate() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let hasActive = false;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      p.life -= 1 / (60 * p.maxLife);
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity
      p.rotation += p.vrotation;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      hasActive = true;

      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    }

    if (hasActive) {
      requestAnimationFrame(animate);
    } else {
      document.body.removeChild(canvas);
    }
  }

  animate();
}
