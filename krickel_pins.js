function pinBorder(el, opts = {}) {
  const u = Math.min(window.innerWidth, 800) / 400;

  const {
    step = 0.5 * u,
    jitter = 1 * u,
    width = 1 * u,
    line = false,
    gap = 4 * u,
    inset = 0,                 // 0 = Pfad liegt auf der Kante, negativ = noch weiter außen
    color = "currentColor"     // "background" = Farbe des Button-Hintergrunds
  } = opts;

  el.insertAdjacentHTML("beforeend",
    `<svg class="krickel" style="position:absolute;left:0;top:0;width:100%;height:100%;overflow:visible;pointer-events:none">
       <path fill="none" stroke="currentColor" stroke-width="${width}" stroke-linejoin="round"/>
     </svg>`);
  const path = el.lastElementChild.querySelector("path");
  const r = () => (Math.random() * 2 - 1) * jitter;

  // Strichfarbe = Hintergrundfarbe des Elements
  function updateColor() {
    if (color !== "background") { path.setAttribute("stroke", color); return; }
    const bg = getComputedStyle(el).backgroundColor;
    const transparent = !bg || bg === "transparent" || bg === "rgba(0, 0, 0, 0)";
    path.setAttribute("stroke", transparent ? "currentColor" : bg);
  }

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

  updateColor();
  draw();
  new ResizeObserver(draw).observe(el);

  // brett.js setzt die Hintergrundfarbe per style-Attribut, evtl. erst nach diesem Script
  if (color === "background") {
    new MutationObserver(updateColor).observe(el, { attributes: true, attributeFilter: ["style", "class"] });
  }
}

// Buttons: Rahmen in Button-Farbe
document.querySelectorAll("button.klein").forEach(el => pinBorder(el, { color: "background" }));
// Überschriften: Unterstreichung (wie bisher in Textfarbe)
document.querySelectorAll("h2").forEach(el => pinBorder(el, { line: true }));