function roughBorder(el, opts = {}) {
  // Faktor: 1 bei 400px Fensterbreite, nach oben begrenzt, damit es am Laptop nicht riesig wird
  const u = Math.min(window.innerWidth, 800) / 400;

  const {
    step = 1 * u,
    jitter = 2 * u,
    width = 2.5 * u,
    line = false,
    gap = 4 * u,
    inset = width / 2 + jitter
  } = opts;

  el.insertAdjacentHTML("beforeend",
    `<svg class="krickel"><path fill="none" stroke="currentColor" stroke-width="${width}" stroke-linejoin="round"/></svg>`);
  const path = el.lastElementChild.firstElementChild;
  const r = () => (Math.random() * 2 - 1) * jitter;




  const seg = (x1, y1, x2, y2) => {
    const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / step));
    return Array.from({ length: n }, (_, k) =>
      `${x1 + (x2 - x1) * k / n + r()},${y1 + (y2 - y1) * k / n + r()}`);
  };

  function draw() {
    const w = el.clientWidth, h = el.clientHeight, p = inset;
    let d;
    if (line) {
      const range = document.createRange();
      range.setStart(el, 0);
      range.setEnd(el, el.childNodes.length - 1);   // das SVG ist das letzte Kind und wird ausgelassen
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
document.querySelectorAll("button:not(.menu, .klein)").forEach(el => roughBorder(el));
// Überschriften: Unterstreichung
document.querySelectorAll("h1").forEach(el => roughBorder(el, { line: true }));