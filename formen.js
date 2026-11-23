const formen = ["dreieck", "kreis", "multieck", "pfad", "viereck"];
const rand = (min, max) => min + Math.random() * (max - min);


// Zufälliger Startpunkt, damit nicht immer dieselbe Form an derselben Kante landet
const start = Math.floor(Math.random() * 4);

formen.forEach((name, i) => {
  const img = new Image();
  img.src = `bilder/${name}.svg`;
  img.alt = "";
  img.setAttribute("aria-hidden", "true");

  img.onload = () => {
    const W = window.innerWidth, H = window.innerHeight;
    const w = rand(500, 500);                          // Breite in px
    const h = w * img.naturalHeight / img.naturalWidth; // Seitenverhältnis bleibt erhalten
    const cut = rand(0.9, 0.5);                       // Anteil, der abgeschnitten wird
    const edge = (start + i) % 4;                      // 0 oben, 1 rechts, 2 unten, 3 links

    let x, y;
    if (edge === 0) { x = rand(0, W - w); y = -h * cut; }
    if (edge === 1) { x = W - w * (1 - cut); y = rand(0, H - h); }
    if (edge === 2) { x = rand(0, W - w); y = H - h * (1 - cut); }
    if (edge === 3) { x = -w * cut; y = rand(0, H - h); }

    img.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${w}px;
      transform: rotate(${rand(0, 360)}deg);
      pointer-events: none;
      z-index: -1;
    `;
    document.body.appendChild(img);
  };
});