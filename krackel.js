function krackelBorder(el, opts = {}) {
  // Faktor: 1 bei 400px Fensterbreite, nach oben begrenzt
  const u = Math.min(window.innerWidth, 800) / 400;

  const {
    step = 1.5 * u,
    jitter = 4 * u,
    width = 2 * u,
    line = false,
    gap = 4 * u,
    inset = width / 2 + jitter
  } = opts;

  el.insertAdjacentHTML("beforeend",
    `<svg class="krackel"><path fill="none" stroke="currentColor" stroke-width="${width}" stroke-linejoin="round"/></svg>`);
  const path = el.lastElementChild.firstElementChild;

  const seg = (x1, y1, x2, y2) => {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;                     // Normale der Kante
    const n = Math.max(2, Math.round(len / step));
    return Array.from({ length: n }, (_, k) => {
      const t = k / n;
      const side = k % 2 ? 1 : -1;                           // abwechselnd innen/außen
      const amp = side * jitter * (1 + 0.5 * Math.random()); // unterschiedlich lange Zacken
      const slide = (Math.random() - 1) * step * 1;          // Verschiebung entlang der Kante
      return `${x1 + dx * t + nx * amp + (dx / len) * slide},${y1 + dy * t + ny * amp + (dy / len) * slide}`;
    });
  };

  function draw() {
    const w = el.clientWidth, h = el.clientHeight, p = inset;
    let d;
    if (line) {
      const range = document.createRange();
      range.setStart(el, 0);
      range.setEnd(el, el.childNodes.length - 1);
      const b = el.getBoundingClientRect(), rows = {};
      for (const q of range.getClientRects()) {
        if (!q.width) continue;
        const row = rows[Math.round(q.bottom)] ??= { x1: q.left, x2: q.right, y: q.bottom };
        row.x1 = Math.min(row.x1, q.left);
        row.x2 = Math.max(row.x2, q.right);
      }
      d = Object.values(rows)
        .map(o => "M" + seg(o.x1 - b.left, o.y - b.top + gap, o.x2 - b.left, o.y - b.top + gap).join("L"))
        .join("");
    } else {
      const c = [[p, p], [w - p, p], [w - p, h - p], [p, h - p]];
      d = "M" + c.flatMap(([x1, y1], i) => seg(x1, y1, ...c[(i + 1) % 4])).join("L") + "Z";
    }
    path.setAttribute("d", d);
  }

  draw();
  new ResizeObserver(draw).observe(el);
}

// Buttons
document.querySelectorAll("button.menu").forEach(el => krackelBorder(el));