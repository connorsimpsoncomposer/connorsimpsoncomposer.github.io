document.addEventListener("DOMContentLoaded", () => {
  const svg = document.getElementById("scroll-visualizer");
  const barCount = 10;
  const maxBarWidth = 80;
  const barHeight = 28;
  const barSpacing = 4;
  const bars = [];

  svg.innerHTML = "";
  svg.setAttribute("width", maxBarWidth - 2);
  svg.setAttribute("height", window.innerHeight);

  const totalBarsHeight = barCount * barHeight + (barCount - 1) * barSpacing;
  const verticalOffset = (window.innerHeight - totalBarsHeight) / 2;

  for (let i = 0; i < barCount; i++) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", maxBarWidth);
    rect.setAttribute("y", verticalOffset + i * (barHeight + barSpacing));
    rect.setAttribute("rx", 3);
    rect.setAttribute("ry", 3);
    rect.setAttribute("width", 0);
    rect.setAttribute("height", barHeight);
    svg.appendChild(rect);
    bars.push(rect);
  }

  function animateBars(scrollY) {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollNorm = Math.min(scrollY / maxScroll, 1);

    const pulseSpeed = 0.05;
    const baseBeat = Math.sin(scrollY * pulseSpeed * Math.PI);

    const pulseStrength = Math.pow(Math.sin(scrollY * pulseSpeed * 0.25 * Math.PI), 12);

    bars.forEach((bar, i) => {
      const freqScale = 1 - Math.abs((i - barCount / 2) / (barCount / 2));

      const phase = (i / barCount) * Math.PI * 2;
      const randomness =
        (Math.sin(scrollY * pulseSpeed * (1 + i * 0.2)) * 0.5 + 0.5) * 0.3;

      let beat = (baseBeat * Math.cos(phase) + randomness + pulseStrength) * scrollNorm;

      beat = Math.max(0, beat);
      const scaled = Math.pow(beat * freqScale, 1.2);

      const width = scaled * maxBarWidth;
      const x = maxBarWidth - width;

      bar.setAttribute("width", width);
      bar.setAttribute("x", x);
    });
  }

  animateBars(window.scrollY);

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        animateBars(window.scrollY);
        ticking = false;
      });
      ticking = true;
    }
  });

  window.addEventListener("resize", () => {
    svg.setAttribute("height", window.innerHeight);
    const totalBarsHeight = barCount * barHeight + (barCount - 1) * barSpacing;
    const verticalOffset = (window.innerHeight - totalBarsHeight) / 2;
    bars.forEach((bar, i) => {
      bar.setAttribute("y", verticalOffset + i * (barHeight + barSpacing));
    });
    animateBars(window.scrollY);
  });
});

