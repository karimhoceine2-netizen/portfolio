// Karim Hoceine — portfolio v2. Plain JS, no libraries.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- Nav roll text, scrolled state, clock ---------- */
  $$(".roll").forEach((el) => { el.innerHTML = `<span class="roll-i">${el.textContent}</span>`; });
  const nav = $("#nav");
  const onNav = () => nav.classList.toggle("scrolled", scrollY > 40);
  addEventListener("scroll", onNav, { passive: true }); onNav();
  const clock = $("#clock");
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Amsterdam", hour: "2-digit", minute: "2-digit" });
  const tick = () => { clock.textContent = fmt.format(new Date()); };
  tick(); setInterval(tick, 15000);

  /* ---------- Split text into words ---------- */
  function split(el) {
    let i = 0;
    if (/^H\d$/.test(el.tagName)) el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim()); // read as one sentence

    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(document.createTextNode(" ")); return; }
            const w = document.createElement("span"); w.className = "w";
            const wi = document.createElement("span"); wi.className = "wi"; wi.textContent = part;
            if (/^H\d$/.test(el.tagName)) w.setAttribute("aria-hidden", "true");
            w.style.setProperty("--d", i++); w.append(wi); frag.append(w);
            wi.style.setProperty("--d", i - 1);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) walk(child);
      });
    };
    walk(el);
  }
  $$("[data-split]").forEach(split);

  /* ---------- Reveal on view ---------- */
  $$("[data-reveal]").forEach((el) => {
    const sibs = $$(":scope > [data-reveal]", el.parentElement);
    el.style.setProperty("--d", sibs.indexOf(el));
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.2, rootMargin: "0px 0px -6% 0px" });
  $$("[data-reveal], [data-split]").forEach((el) => io.observe(el));

  /* ---------- Hero dot field ---------- */
  const canvas = $("#field");
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0, dpr = 1, dots = [], start = performance.now();
  const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
  let running = false;
  function layout() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const gap = W < 700 ? 22 : 28;
    dots = [];
    for (let y = gap / 2; y < H; y += gap) for (let x = gap / 2; x < W; x += gap) dots.push({ x, y, ox: 0, oy: 0 });
    wake();
  }
  function draw(now) {
    const t = (now - start) / 1000;
    mouse.x = lerp(mouse.x, mouse.tx, 0.16); mouse.y = lerp(mouse.y, mouse.ty, 0.16);
    ctx.clearRect(0, 0, W, H);
    const R = 170, wave = reduce ? -1 : t * 900 - 200; // intro wave travels left → right once
    let moving = !reduce && t < 2.2;
    for (const d of dots) {
      const dx = d.x - mouse.x, dy = d.y - mouse.y, dist = Math.hypot(dx, dy);
      let f = dist < R ? 1 - dist / R : 0; f = f * f * (3 - 2 * f);
      const tx = dist > 0 ? (dx / dist) * f * 12 : 0, ty = dist > 0 ? (dy / dist) * f * 12 : 0;
      d.ox = lerp(d.ox, tx, 0.14); d.oy = lerp(d.oy, ty, 0.14);
      if (Math.abs(d.ox - tx) > 0.05 || Math.abs(d.oy - ty) > 0.05) moving = true;
      const wd = Math.abs(d.x + d.y * 0.35 - wave);
      const w = wd < 140 ? 1 - wd / 140 : 0;
      const fade = clamp(1.15 - d.y / H, 0, 1); // fade toward the headline
      const a = (0.14 + f * 0.6 + w * 0.5) * fade;
      const r = 0.9 + f * 1.6 + w * 1.1;
      ctx.fillStyle = `rgba(15,15,14,${a.toFixed(3)})`;
      ctx.beginPath(); ctx.arc(d.x + d.ox, d.y + d.oy, r, 0, 6.2832); ctx.fill();
    }
    if (Math.abs(mouse.x - mouse.tx) > 0.5) moving = true;
    if (moving) requestAnimationFrame(draw); else running = false;
  }
  function wake() { if (!running) { running = true; requestAnimationFrame(draw); } }
  const hero = $(".hero");
  if (fine && !reduce) {
    hero.addEventListener("pointermove", (e) => { const r = canvas.getBoundingClientRect(); mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top; if (mouse.x < -999) { mouse.x = mouse.tx; mouse.y = mouse.ty; } wake(); });
    hero.addEventListener("pointerleave", () => { mouse.tx = -9999; mouse.ty = -9999; mouse.x = -9999; mouse.y = -9999; wake(); });
  }
  addEventListener("resize", layout);
  layout();

  /* ---------- Stacking, tilting panels ---------- */
  const cards = $$(".card");
  const inners = cards.map((c) => $(".card-inner", c));
  const wide = matchMedia("(min-width: 761px)");
  let ticking = false;
  function stack() {
    ticking = false;
    const vh = innerHeight;
    cards.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const t = clamp((vh - r.top) / (vh * 0.8), 0, 1);
      const e = 1 - Math.pow(1 - t, 3);
      const rot = reduce ? 0 : (1 - e) * 14;
      let scale = 1, cover = 0;
      const next = cards[i + 1];
      if (next && wide.matches && !reduce) {
        const nr = next.getBoundingClientRect();
        const c = clamp(1 - (nr.top - r.top) / r.height, 0, 1);
        scale = 1 - c * 0.05; cover = c * 0.55;
      }
      if (!wide.matches && !reduce) {
        scale = 0.92 + 0.08 * e; // grow in
        const leave = clamp(1 - r.bottom / (vh * 0.55), 0, 1);
        scale *= 1 - leave * 0.08; cover = leave * 0.6;
      }
      inners[i].style.transform = `rotateX(${rot.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      inners[i].style.setProperty("--cover", cover.toFixed(3));
    });
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { stack(); scrub(); }); } };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);

  /* ---------- Panel demos ---------- */
  function countUp(el, to, ms = 1200, fmtFn = (v) => v) {
    if (reduce) { el.textContent = fmtFn(to); return; }
    const t0 = performance.now();
    const step = (now) => {
      const p = clamp((now - t0) / ms, 0, 1), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmtFn(Math.round(to * e));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const demos = {
    async rewind(card) {
      const lines = $$(".term-lines li", card);
      for (const li of lines) { li.classList.add("on"); if (!reduce) await sleep(560); }
      $$("[data-count]", card).forEach((td) => countUp(td, +td.dataset.count));
    },
    rag(card) {
      card.classList.add("live");
      $$("[data-frac]", card).forEach((b) => {
        const [n, d] = b.dataset.frac.split("/").map(Number);
        countUp(b, n, 1500, (v) => `${v}/${d}`);
      });
    },
    async flow(card) {
      const steps = $$(".flow li", card), list = $(".flow", card), status = $("#flow-status");
      const labels = ["Researching organisations", "Checking every source", "Waiting for review", "Draft ready in Gmail · not sent"];
      const show = (k) => {
        steps.forEach((s, j) => { s.classList.toggle("done", j < k); s.classList.toggle("now", j === k); });
        list.style.setProperty("--p", k / (steps.length - 1));
        status.textContent = labels[k];
      };
      if (reduce) { show(steps.length - 1); return; }
      for (;;) {
        for (let k = 0; k < steps.length; k++) { show(k); await sleep(k === 2 ? 2000 : 1200); }
        await sleep(2600);
      }
    },
  };
  const demoIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      demoIO.unobserve(e.target);
      demos[e.target.dataset.demo]?.(e.target);
    });
  }, { threshold: 0.45 });
  cards.forEach((c) => demoIO.observe(c));

  /* ---------- About: scroll-scrubbed words ---------- */
  const scrubEl = $("[data-scrub]");
  split(scrubEl);
  const scrubWords = $$(".w", scrubEl);
  function scrub() {
    const r = scrubEl.getBoundingClientRect(), vh = innerHeight;
    const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.25), 0, 1);
    const n = Math.round(p * scrubWords.length);
    scrubWords.forEach((w, i) => w.classList.toggle("lit", i < n));
  }
  stack(); scrub();

  /* ---------- Cursor label + list preview ---------- */
  if (fine && !reduce) {
    const cur = $("#cursor"), label = $("span", cur);
    const pv = $("#preview"), img = $("img", pv);
    const pos = { x: 0, y: 0, cx: 0, cy: 0, px: 0, py: 0, vx: 0 };
    let previewOn = false;
    addEventListener("pointermove", (e) => { pos.x = e.clientX; pos.y = e.clientY; });
    const loop = () => {
      pos.cx = lerp(pos.cx, pos.x, 0.22); pos.cy = lerp(pos.cy, pos.y, 0.22);
      cur.style.transform = `translate3d(${pos.cx + 16}px, ${pos.cy + 16}px, 0)`;
      const nx = lerp(pos.px, pos.x, 0.12), ny = lerp(pos.py, pos.y, 0.12);
      pos.vx = lerp(pos.vx, nx - pos.px, 0.2); pos.px = nx; pos.py = ny;
      pv.style.transform = `translate3d(${nx + 30}px, ${ny - 110}px, 0) rotate(${clamp(pos.vx * 0.6, -9, 9).toFixed(2)}deg) scale(${previewOn ? 1 : 0.6})`;
      requestAnimationFrame(loop);
    };
    pv.style.transition = "opacity .35s cubic-bezier(.22,1,.36,1)";
    pv.style.left = "0"; pv.style.top = "0";
    requestAnimationFrame(loop);
    $$("[data-cursor]").forEach((el) => {
      el.addEventListener("pointerenter", () => { label.textContent = el.dataset.cursor; cur.classList.add("label"); });
      el.addEventListener("pointerleave", () => { cur.classList.remove("label"); });
    });
    $$("[data-preview]").forEach((row) => {
      row.addEventListener("pointerenter", () => { img.src = row.dataset.preview; previewOn = true; pv.classList.add("on"); });
      row.addEventListener("pointerleave", () => { previewOn = false; pv.classList.remove("on"); });
    });

    /* Magnetic buttons */
    $$(".magnetic").forEach((b) => {
      const inner = $("span", b);
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
        b.style.transform = `translate(${dx * 0.22}px, ${dy * 0.34}px)`;
        inner.style.transform = `translate(${dx * 0.12}px, ${dy * 0.18}px)`;
      });
      b.addEventListener("pointerleave", () => { b.style.transform = ""; inner.style.transform = ""; });
      b.style.transition = "transform .5s cubic-bezier(.22,1,.36,1), background .3s, border-color .3s";
      inner.style.transition = "transform .5s cubic-bezier(.22,1,.36,1)";
    });
  }

  /* ---------- Copy email ---------- */
  const toast = $("#toast");
  $("#copy").addEventListener("click", async (e) => {
    const email = e.currentTarget.dataset.email;
    try { await navigator.clipboard.writeText(email); toast.textContent = "Email copied"; }
    catch { toast.textContent = email; }
    toast.classList.add("on"); setTimeout(() => toast.classList.remove("on"), 2200);
  });
})();
