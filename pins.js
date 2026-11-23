{
  const box = document.querySelector("#col2");
  const btns = box ? [...box.querySelectorAll("button.klein")] : [];

  // Deine ca. 6 Farben hier festlegen
  const palette = ["#FFB2E8", "#FF9676", "#FF73D5", "#FAFFB2", "#F6FF7C", "#CFFFE6", "#75FFB8", "#96BAFF"];

  const shuffle = arr => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };



  
  // Farben einmalig vergeben (bei mehr Buttons als Farben wiederholen sie sich)
  const colors = shuffle([...palette]);
  btns.forEach((b, i) => { b.style.backgroundColor = colors[i % colors.length]; });




  function scatter() {
    const W = box.clientWidth, H = box.clientHeight;
    const placed = [];                       // Mittelpunkte der bereits gesetzten Buttons

    shuffle([...btns]).forEach(b => {
      const w = b.offsetWidth, h = b.offsetHeight;
      const deg = (Math.random() * 2 - 1) * 14;          // Neigung: -14° bis +14°
      const rad = Math.abs(deg) * Math.PI / 180;
      // Platzbedarf des gedrehten Buttons
      const bw = w * Math.cos(rad) + h * Math.sin(rad);
      const bh = w * Math.sin(rad) + h * Math.cos(rad);

      // Mehrere zufällige Positionen probieren, die mit dem größten Abstand zu den anderen gewinnt
      let best = null, bestDist = -1;
      for (let k = 0; k < 40; k++) {
        const cx = bw / 2 + Math.random() * Math.max(0, W - bw);
        const cy = bh / 2 + Math.random() * Math.max(0, H - bh);
        const dist = placed.length
          ? Math.min(...placed.map(p => Math.hypot(p[0] - cx, p[1] - cy)))
          : Infinity;
        if (dist > bestDist) { bestDist = dist; best = [cx, cy]; }
      }
      placed.push(best);

      b.style.left = best[0] - w / 2 + "px";
      b.style.top = best[1] - h / 2 + "px";
      b.style.transform = `rotate(${deg}deg)`;
    });
  }

  if (btns.length) {
    document.fonts.ready.then(scatter);

    let t;
    window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(scatter, 200); });

    // Test am PC: Doppelklick auf eine freie Stelle in #col2
    box.addEventListener("dblclick", e => { if (e.target === box) scatter(); });

    // Schütteln: mindestens 4 kräftige Ausschläge innerhalb von 1 Sekunde
    let prev = null, hits = [], lastShake = 0, enabled = false;

    function onMotion(e) {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const cur = [a.x || 0, a.y || 0, a.z || 0];
      if (prev) {
        const delta = Math.hypot(cur[0] - prev[0], cur[1] - prev[1], cur[2] - prev[2]);
        const now = Date.now();
        if (delta > 12) hits.push(now);
        hits = hits.filter(t0 => now - t0 < 1000);
        if (hits.length >= 4 && now - lastShake > 1000) {
          lastShake = now;
          hits = [];
          scatter();
        }
      }
      prev = cur;
    }

    function enableShake() {
      if (enabled) return;
      enabled = true;
      window.addEventListener("devicemotion", onMotion);
    }

    if (typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function") {
      document.addEventListener("click", () => {
        DeviceMotionEvent.requestPermission()
          .then(s => { if (s === "granted") enableShake(); })
          .catch(() => {});
      }, { once: true });
    } else {
      enableShake();
    }
  }
}