const formen = ["dreieck", "kreis", "multieck", "pfad", "viereck"];
const rand = (min, max) => min + Math.random() * (max - min);

// Intro-Layout: x/y = Mittelpunkt in % der Fenstergröße, size = Breite in vw, rot = Grad
const intro = {
  pfad:     { x: 28, y: 20, size: 42, rot: 0,   z: 2 },  // pink, oben links
  kreis:    { x: 51, y: 25, size: 42, rot: 0,   z: 1 },  // gelb, oben Mitte
  viereck:  { x: 49, y: 40, size: 70, rot: 0, z: 2 },  // mint, mittig, gekippt
  multieck: { x: 42, y: 60, size: 52, rot: 0,   z: 1 },  // blau, unten links
  dreieck:  { x: 70, y: 70, size: 44, rot: 0,   z: 2 }   // orange, unten rechts
};
const DAUER_INTRO = 2000;  // ms, die der Intro-Screen sichtbar bleibt
const DAUER_ANIM  = 1200;  // ms, die das Gleiten dauert

// Zufälliger Startpunkt, damit nicht immer dieselbe Form an derselben Kante landet
const start = Math.floor(Math.random() * 5);

const W = window.innerWidth, H = window.innerHeight;

const geladen = formen.map((name, i) => new Promise(resolve => {
  const img = new Image();
  img.src = `bilder/${name}.svg`;
  img.alt = "";
  img.className = "form";
  img.setAttribute("aria-hidden", "true");
  img.onerror = () => { console.error("Nicht geladen:", img.src); resolve(null); };

  img.onload = () => {
    const ratio = img.naturalWidth ? img.naturalHeight / img.naturalWidth : 1;

    // Zielposition (deine bisherige Logik)
    const w = rand(200, 250);
    const h = w * ratio;
    const cut = rand(0.8, 0.5);
    const edge = (start + i) % 5;   // 0 und 4 oben, 1 rechts, 2 unten, 3 links

    const half = H / 2;
    let x, y;
    if (edge === 0) { x = rand(0, W - w); y = -h * cut; }                                  // oben
    if (edge === 1) { x = W - w * (1 - cut); y = rand(0, Math.max(0, half - h)); }         // rechts, obere Hälfte
    if (edge === 2) { x = rand(0, W - w); y = H - h * (1 - cut); }                         // unten
    if (edge === 3) { x = -w * cut; y = rand(0, Math.max(0, half - h)); }                  // links, obere Hälfte
    if (edge === 4) { x = W - w * (1 - cut); y = rand(half, Math.max(half, H - h)); }      // rechts, untere Hälfte
    const ziel = { x, y, w, h, rot: rand(0, 360) };

    // Startposition aus dem Intro-Layout
    const s = intro[name];
    const sw = s.size / 100 * W;
    const sh = sw * ratio;

    img.style.cssText = `
      position: fixed;
      left: ${s.x / 100 * W - sw / 2}px;
      top: ${s.y / 100 * H - sh / 2}px;
      width: ${sw}px;
      height: ${sh}px;
      transform: rotate(${s.rot}deg);
      pointer-events: none;
      z-index: ${s.z};
    `;
    document.body.appendChild(img);
    resolve({ img, ziel });
  };
}));

Promise.all(geladen).then(items => {
  items = items.filter(Boolean);

  setTimeout(() => {
    document.body.classList.remove("intro");
    document.getElementById("intro")?.classList.add("weg");

    const ease = `${DAUER_ANIM}ms cubic-bezier(.65, 0, .35, 1)`;
    items.forEach(({ img, ziel }) => {
      img.style.transition =
        `left ${ease}, top ${ease}, width ${ease}, height ${ease}, transform ${ease}`;
      img.style.left = ziel.x + "px";
      img.style.top = ziel.y + "px";
      img.style.width = ziel.w + "px";
      img.style.height = ziel.h + "px";
      img.style.transform = `rotate(${ziel.rot}deg)`;

      // Nach der Animation wieder hinter den Inhalt
      img.addEventListener("transitionend", e => {
        if (e.propertyName === "left") img.style.zIndex = -1;
      });
    });
  }, DAUER_INTRO);
});