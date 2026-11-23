function roughBorder(el, opts = {}) {
  // Faktor: 1 bei 400px Fensterbreite, nach oben begrenzt
  const u = Math.min(window.innerWidth, 800) / 400;

  const {
    step = 0.1 * u,
    jitter = 4 * u,
    width = 0.5 * u,
    line = false,
    gap = 4 * u,
    inset = width / 2 + jitter,
    stroke = null,   // null = Farbe der Füllung; sonst z. B. "#fff"
    fill = null      // null = bisherige Hintergrundfarbe des Buttons übernehmen
  } = opts;

  const cs = getComputedStyle(el);

  // Füllfarbe: bisherige Hintergrundfarbe merken, Button selbst transparent machen
  let fillColor = "none";
  if (!line) {
    const bg = fill ?? cs.backgroundColor;
    const transparent = !bg || bg === "transparent" || bg === "rgba(0, 0, 0, 0)";
    if (!transparent) fillColor = bg;
    el.style.setProperty("background-color", "transparent", "important");
  }

  // Linienfarbe einmalig festlegen, damit sie der Textfarbe nicht mehr folgt
  const strokeColor = stroke ?? (fillColor !== "none" ? fillColor : cs.color);

  if (cs.position === "static") el.style.position = "relative";
  el.style.isolation = "isolate";   // Füllung bleibt hinter dem Text, aber im Button

  el.insertAdjacentHTML("beforeend",
    `<svg class="krickel" style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none;z-index:-1">
       <path fill="${fillColor}" stroke="${strokeColor}" stroke-width="${width}" stroke-linejoin="round"/>
     </svg>`);
  const path = el.lastElementChild.querySelector("path");
  const r = () => (Math.random() * 2 - 1) * jitter;

  // Wie bei krickel: jeder Punkt wird zufällig in x und y versetzt
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
document.querySelectorAll("button.menu").forEach(el => roughBorder(el));