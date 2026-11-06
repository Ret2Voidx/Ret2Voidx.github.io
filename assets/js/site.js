/* =====================================================================
   Ret2Void · Light EDR learning site — motion, background and labs.
   No dependencies. Everything respects prefers-reduced-motion and the
   in-page motion switch.
   ===================================================================== */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement, body = doc.body;
  var FA = root.lang === 'fa';
  var RTL = root.dir === 'rtl';
  var mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  var motionOn = !mqReduce.matches && store('r2v-motion') !== 'off';
  function applyMotion() {
    body.classList.toggle('no-motion', !motionOn);
    var b = doc.querySelector('.motion');
    if (b) b.setAttribute('aria-pressed', String(motionOn));
  }
  applyMotion();
  var mb = doc.querySelector('.motion');
  if (mb) mb.addEventListener('click', function () { motionOn = !motionOn; store('r2v-motion', motionOn ? 'on' : 'off'); applyMotion(); });

  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
  var T = FA ? {
    q: { offered: 'ورودی', stored: 'ذخیره', dropped: 'دورریخته', peak: 'اوج صف', burst: 'انفجار رویداد', reset: 'از نو', inRate: 'نرخ رویداد از kernel', outRate: 'سرعت نویسنده', ok: 'صف جا دارد؛ هیچ رویدادی از دست نمی‌رود.', bad: 'صف پر شد: جدیدترین رویدادها دور ریخته و شمرده می‌شوند. هیچ‌وقت بی‌صدا نیست.' },
    r: { evt: 'رویداد ProcessStart', parent: 'والد (ParentImage)', image: 'پروسس (Image)', folder: 'پوشه', match: 'MATCH', none: 'match نشد', noHit: 'هیچ قاعده‌ای fire نکرد. این رویداد فقط ذخیره می‌شود.', hits: function (n) { return n + ' قاعده fire کرد → هشدار در جدول alerts، در همان transaction رویداد.'; } },
    m: { scan: 'اسکن کن', scanning: 'در حال اسکن…', skipG: 'guard: خوانده نمی‌شود', img: 'image-backed', noX: 'غیراجرایی', mapped: 'mapped + فایل', quiet: 'H1 دیده شد ولی هیچ نشانه‌ی تأییدکننده‌ای نبود → فقط شمرده می‌شود، هشدار نه.', clean: 'هیچ H1ی پیدا نشد → اسکن تمیز، هیچ ردیفی نوشته نمی‌شود.', start: 'یک سناریو انتخاب کن و «اسکن کن» را بزن.' }
  } : {
    q: { offered: 'offered', stored: 'stored', dropped: 'dropped', peak: 'queue peak', burst: 'Event burst', reset: 'Reset', inRate: 'Events from the kernel', outRate: 'Writer speed', ok: 'The queue has room: nothing is lost.', bad: 'Queue full: the newest events are dropped and counted. Never silently.' },
    r: { evt: 'ProcessStart event', parent: 'Parent (ParentImage)', image: 'Process (Image)', folder: 'Folder', match: 'MATCH', none: 'no match', noHit: 'No rule fired. The event is only stored.', hits: function (n) { return n + (n === 1 ? ' rule' : ' rules') + ' fired → rows in alerts, in the same transaction as the event.'; } },
    m: { scan: 'Scan', scanning: 'Scanning…', skipG: 'guard: never read', img: 'image-backed', noX: 'not executable', mapped: 'mapped + file', quiet: 'H1 found, but no corroborating signal → counted only, no alert.', clean: 'No H1 at all → a clean scan writes no rows.', start: 'Pick a scenario and press Scan.' }
  };

  /* ---------------- top bar, progress, to-top, side menu ---------------- */
  var bar = doc.querySelector('.progress span'), top = doc.querySelector('.topbar'), toTop = doc.querySelector('.to-top');
  function onScroll() {
    var h = root.scrollHeight - innerHeight, p = h > 0 ? scrollY / h : 0;
    if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    if (top) top.classList.toggle('scrolled', scrollY > 30);
    if (toTop) toTop.classList.toggle('show', scrollY > innerHeight * 1.2);
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var menu = doc.querySelector('.menu-btn');
  if (menu) menu.addEventListener('click', function () { body.classList.toggle('side-open'); });
  doc.querySelectorAll('.side a').forEach(function (a) { a.addEventListener('click', function () { body.classList.remove('side-open'); }); });

  /* ---------------- cursor spotlight ---------------- */
  var mouse = { x: innerWidth / 2, y: innerHeight / 3, nx: 0, ny: 0, active: false };
  addEventListener('pointermove', function (e) {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
    mouse.nx = (e.clientX / innerWidth) * 2 - 1; mouse.ny = (e.clientY / innerHeight) * 2 - 1;
    root.style.setProperty('--cx', e.clientX + 'px'); root.style.setProperty('--cy', e.clientY + 'px');
  }, { passive: true });

  /* ---------------- loader ---------------- */
  var loader = doc.querySelector('.loader');
  if (loader) {
    if (!motionOn) loader.remove();
    else {
      var lc = loader.querySelector('b'), t0 = performance.now();
      (function step(t) {
        var p = Math.min(1, (t - t0) / 1100), e = 1 - Math.pow(1 - p, 3);
        lc.textContent = String(Math.round(e * 100)).padStart(3, '0');
        if (p < 1) requestAnimationFrame(step);
        else { loader.classList.add('done'); setTimeout(function () { loader.remove(); }, 700); }
      })(t0);
    }
  }

  /* ---------------- background field (fixed, reacts to the cursor) ---------------- */
  var bg = doc.getElementById('bgfield');
  if (bg && bg.getContext) {
    var bx = bg.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 2), W, H, nodes = [];
    var COLORS = ['167,139,250', '124,58,237', '88,166,255'];
    function resize() {
      W = innerWidth; H = innerHeight; bg.width = W * dpr; bg.height = H * dpr; bx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(130, W * H / 11000)); nodes = [];
      for (var i = 0; i < n; i++) {
        var z = Math.random();
        nodes.push({ x: Math.random() * W, y: Math.random() * H, z: z, vx: (Math.random() - .5) * .15, vy: (Math.random() - .5) * .15, c: COLORS[i % 3], ox: 0, oy: 0 });
      }
    }
    resize(); addEventListener('resize', resize);
    var px = 0, py = 0, sy = 0;
    function drawBg() {
      px += (mouse.nx - px) * .05; py += (mouse.ny - py) * .05; sy = scrollY;
      bx.clearRect(0, 0, W, H);
      var pts = [];
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i], depth = .3 + n.z * 1.2;
        if (motionOn) { n.x += n.vx; n.y += n.vy; }
        if (n.x < -40) n.x = W + 40; if (n.x > W + 40) n.x = -40; if (n.y < -40) n.y = H + 40; if (n.y > H + 40) n.y = -40;
        var X = n.x - px * 38 * depth, Y = n.y - py * 30 * depth - ((sy * .08 * depth) % (H + 80));
        if (Y < -40) Y += H + 80;
        var dx = X - mouse.x, dy = Y - mouse.y, d2 = dx * dx + dy * dy;
        if (mouse.active && d2 < 22000 && motionOn) { var f = (1 - d2 / 22000) * 26 * depth; var d = Math.sqrt(d2) || 1; n.ox += (dx / d * f - n.ox) * .08; n.oy += (dy / d * f - n.oy) * .08; }
        else { n.ox *= .94; n.oy *= .94; }
        pts.push([X + n.ox, Y + n.oy, depth, n.c]);
      }
      for (i = 0; i < pts.length; i++) {
        for (var j = i + 1; j < pts.length; j++) {
          var ax = pts[i][0] - pts[j][0], ay = pts[i][1] - pts[j][1], dd = ax * ax + ay * ay;
          if (dd < 15000) { bx.strokeStyle = 'rgba(124,58,237,' + (0.16 * (1 - dd / 15000)).toFixed(3) + ')'; bx.lineWidth = 1; bx.beginPath(); bx.moveTo(pts[i][0], pts[i][1]); bx.lineTo(pts[j][0], pts[j][1]); bx.stroke(); }
        }
        var md = Math.hypot(pts[i][0] - mouse.x, pts[i][1] - mouse.y), near = mouse.active && md < 160 ? 1 - md / 160 : 0;
        bx.fillStyle = 'rgba(' + pts[i][3] + ',' + (0.25 + 0.35 * pts[i][2] / 1.5 + near * .5).toFixed(3) + ')';
        bx.beginPath(); bx.arc(pts[i][0], pts[i][1], 1 + pts[i][2] * 1.3 + near * 2, 0, 6.283); bx.fill();
        if (near > .4) { bx.strokeStyle = 'rgba(167,139,250,' + (near * .35).toFixed(3) + ')'; bx.beginPath(); bx.moveTo(pts[i][0], pts[i][1]); bx.lineTo(mouse.x, mouse.y); bx.stroke(); }
      }
      requestAnimationFrame(drawBg);
    }
    requestAnimationFrame(drawBg);
  }

  /* ---------------- hero: floating cards that follow the cursor ---------------- */
  var floats = doc.querySelectorAll('.float');
  if (floats.length) {
    var fx = 0, fy = 0;
    (function tilt() {
      if (motionOn) {
        fx += (mouse.nx - fx) * .06; fy += (mouse.ny - fy) * .06;
        var t = performance.now() / 1000;
        floats.forEach(function (el, i) {
          var d = parseFloat(el.dataset.depth || '1'), bobY = Math.sin(t * .8 + i) * 6;
          el.style.transform = 'translate3d(' + (-fx * 28 * d).toFixed(1) + 'px,' + (-fy * 22 * d + bobY).toFixed(1) + 'px,0) rotateX(' + (fy * 8).toFixed(2) + 'deg) rotateY(' + (-fx * 10).toFixed(2) + 'deg) rotate(' + (el.dataset.rot || 0) + 'deg)';
        });
      }
      requestAnimationFrame(tilt);
    })();
  }

  /* ---------------- hero: event flow canvas ---------------- */
  var hc = doc.getElementById('flow');
  if (hc && hc.getContext) {
    var hx = hc.getContext('2d'), HW, HH, parts = [], bursts = [], visible = true;
    var L = FA ? ['KERNEL · ETW', 'FILTER', 'RULES', 'lightedr.db'] : ['KERNEL · ETW', 'FILTER', 'RULES', 'lightedr.db'];
    function hres() { var r = hc.getBoundingClientRect(); HW = r.width; HH = r.height; hc.width = HW * dpr2; hc.height = HH * dpr2; hx.setTransform(dpr2, 0, 0, dpr2, 0, 0); }
    var dpr2 = Math.min(devicePixelRatio || 1, 2); hres(); addEventListener('resize', hres);
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(hc);
    var G = [0.06, 0.4, 0.66, 0.9], lane = function () { return HH * (0.62 + (Math.random() - .5) * .4); };
    function spawn() {
      var y = lane(), r = Math.random();
      parts.push({ x: HW * G[0], y: y, y0: y, v: 1.4 + Math.random() * 1.6, fate: r < 0.86 ? 'drop' : (r < 0.97 ? 'store' : 'alert'), a: 1, ph: Math.random() * 6 });
    }
    function hdraw() {
      if (visible) {
        hx.clearRect(0, 0, HW, HH);
        var yb = HH * 0.62;
        for (var g = 0; g < 4; g++) {
          var X = HW * G[g];
          hx.strokeStyle = g === 0 ? 'rgba(88,166,255,0.35)' : 'rgba(124,58,237,0.32)'; hx.setLineDash([4, 6]); hx.lineWidth = 1;
          hx.beginPath(); hx.moveTo(X, yb - HH * .3); hx.lineTo(X, yb + HH * .3); hx.stroke(); hx.setLineDash([]);
          hx.fillStyle = 'rgba(139,152,165,0.75)'; hx.font = '10.5px "JetBrains Mono", monospace';
          hx.textAlign = g === 0 ? 'left' : (g === 3 ? 'right' : 'center');
          hx.fillText(L[g], g === 0 ? Math.max(2, X - 30) : (g === 3 ? Math.min(HW - 2, X + 30) : X), yb - HH * .38);
        }
        if (motionOn) for (var s = 0; s < 3; s++) if (Math.random() < .8) spawn();
        for (var i = parts.length - 1; i >= 0; i--) {
          var p = parts[i];
          if (motionOn) { p.x += p.v * (HW / 900); p.ph += .05; p.y = p.y0 + Math.sin(p.ph) * 2; }
          var col = p.fate === 'alert' && p.x > HW * G[2] ? '248,81,73' : (p.x > HW * G[1] && p.fate !== 'drop' ? '167,139,250' : '88,166,255');
          if (p.fate === 'drop' && p.x > HW * G[1]) { p.a -= .04; p.y0 += .9; }
          if (p.fate === 'alert' && !p.b && p.x > HW * G[2]) { p.b = 1; bursts.push({ x: p.x, y: p.y, r: 2, a: 1 }); }
          if (p.a <= 0 || p.x > HW * G[3]) { parts.splice(i, 1); continue; }
          hx.fillStyle = 'rgba(' + col + ',' + p.a.toFixed(2) + ')';
          hx.shadowColor = 'rgba(' + col + ',0.9)'; hx.shadowBlur = p.fate === 'alert' ? 14 : 6;
          hx.beginPath(); hx.arc(p.x, p.y, p.fate === 'alert' ? 3.2 : 1.8, 0, 6.283); hx.fill(); hx.shadowBlur = 0;
        }
        for (i = bursts.length - 1; i >= 0; i--) {
          var b = bursts[i]; b.r += 1.6; b.a -= .025;
          if (b.a <= 0) { bursts.splice(i, 1); continue; }
          hx.strokeStyle = 'rgba(248,81,73,' + b.a.toFixed(2) + ')'; hx.lineWidth = 1.5; hx.beginPath(); hx.arc(b.x, b.y, b.r, 0, 6.283); hx.stroke();
        }
        var DX = HW * G[3];
        hx.strokeStyle = 'rgba(167,139,250,0.6)'; hx.fillStyle = 'rgba(124,58,237,0.18)'; hx.lineWidth = 1.4;
        hx.beginPath(); hx.ellipse(DX, yb - 16, 22, 6, 0, 0, 6.283); hx.fill(); hx.stroke();
        hx.beginPath(); hx.moveTo(DX - 22, yb - 16); hx.lineTo(DX - 22, yb + 16); hx.ellipse(DX, yb + 16, 22, 6, 0, Math.PI, 0, true); hx.lineTo(DX + 22, yb - 16); hx.stroke();
      }
      requestAnimationFrame(hdraw);
    }
    requestAnimationFrame(hdraw);
  }

  /* ---------------- title scramble ---------------- */
  var tt = doc.querySelector('[data-scramble]');
  if (tt && motionOn) {
    var final = tt.textContent, chars = '!<>-_\\/[]{}=+*^?#01ABCDEF', frame = 0;
    (function sc() {
      var out = '', done = true;
      for (var i = 0; i < final.length; i++) {
        if (final[i] === ' ' || frame > i * 2.2 + 10) out += final[i];
        else { out += chars[(Math.random() * chars.length) | 0]; done = false; }
      }
      tt.textContent = out; frame++;
      if (!done) setTimeout(sc, 34); else tt.textContent = final;
    })();
  }

  /* ---------------- terminal typing ---------------- */
  var term = doc.querySelector('.term pre');
  if (term) {
    var lines = JSON.parse(term.dataset.lines || '[]'), out = '', li = 0, ci = 0;
    function line(l) { return l.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/^(\$ )/, '<span class="k">$1</span>').replace(/(ALERT.*)$/, '<span class="r">$1</span>').replace(/(dropped=0|0 dropped|OK)/g, '<span class="g">$1</span>'); }
    if (!motionOn) { term.innerHTML = lines.map(line).join('\n'); }
    else (function type() {
      if (li >= lines.length) { term.innerHTML = lines.map(line).join('\n') + ' <span class="cur"></span>'; return; }
      var l = lines[li];
      if (ci <= l.length) { term.innerHTML = lines.slice(0, li).map(line).join('\n') + (li ? '\n' : '') + line(l.slice(0, ci)) + '<span class="cur"></span>'; ci += l[0] === '$' ? 1 : 3; setTimeout(type, l[0] === '$' ? 38 : 12); }
      else { li++; ci = 0; setTimeout(type, 260); }
    })();
  }

  /* ---------------- count-up stats ---------------- */
  var ioStat = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; ioStat.unobserve(e.target);
      var el = e.target, to = parseFloat(el.dataset.to), suf = el.dataset.suf || '', dec = +(el.dataset.dec || 0), t0 = performance.now();
      var f = function (v) { return (dec ? v.toFixed(dec) : fmt(v)) + suf; };
      if (!motionOn) { el.textContent = f(to); return; }
      (function st(t) { var p = Math.min(1, (t - t0) / 1600), v = to * (1 - Math.pow(1 - p, 4)); el.textContent = f(v); if (p < 1) requestAnimationFrame(st); })(t0);
    });
  });
  doc.querySelectorAll('[data-to]').forEach(function (el) { ioStat.observe(el); });

  /* ---------------- card spotlight ---------------- */
  doc.querySelectorAll('.card').forEach(function (c) {
    c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });

  /* ---------------- reveal + diagram motion ---------------- */
  var main = doc.querySelector('main');
  if (main) main.querySelectorAll('figure, .note, .tw, pre, .file, .concept, .lab, details, .files-list > .file').forEach(function (el) { el.classList.add('reveal'); });
  function flowDots(svg) {
    if (svg.dataset.flow) return; svg.dataset.flow = '1';
    var ns = 'http://www.w3.org/2000/svg', lines = svg.querySelectorAll('.s-lna');
    var items = [];
    lines.forEach(function (ln, i) {
      if (!ln.getTotalLength) return; var len = ln.getTotalLength(); if (len < 20) return;
      ln.classList.add('flow');
      var c = doc.createElementNS(ns, 'circle'); c.setAttribute('r', '3'); c.setAttribute('class', 'flowdot'); svg.appendChild(c);
      items.push({ ln: ln, len: len, c: c, off: (i * 0.37) % 1 });
    });
    if (!items.length) return;
    var vis = true; new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(svg);
    (function run(t) {
      if (vis && motionOn) items.forEach(function (it) {
        var p = ((t / 1800) + it.off) % 1, pt = it.ln.getPointAtLength(p * it.len);
        if (it.ln.tagName === 'line' || it.ln.tagName === 'path') { it.c.setAttribute('cx', pt.x); it.c.setAttribute('cy', pt.y); }
        it.c.style.opacity = p < .08 ? p / .08 : (p > .92 ? (1 - p) / .08 : 1);
      });
      else items.forEach(function (it) { it.c.style.opacity = 0; });
      requestAnimationFrame(run);
    })(0);
  }
  var ioRev = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; var el = e.target; el.classList.add('in'); ioRev.unobserve(el);
      el.querySelectorAll('svg.d').forEach(function (svg) {
        if (motionOn) {
          var kids = svg.children, k = 0;
          for (var i = 0; i < kids.length; i++) { if (kids[i].tagName === 'defs') continue; kids[i].style.animationDelay = Math.min(k++ * 18, 900) + 'ms'; }
          svg.classList.add('drawn');
          svg.querySelectorAll('[data-grow]').forEach(function (r) { r.classList.add('grow'); });
        }
        flowDots(svg);
      });
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  doc.querySelectorAll('.reveal').forEach(function (el) { ioRev.observe(el); });

  /* ---------------- side nav active state ---------------- */
  var links = {}; doc.querySelectorAll('.side a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
  var secIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('seen');
        var id = e.target.id, a = links[id];
        if (a) { Object.keys(links).forEach(function (k) { links[k].classList.remove('active'); }); a.classList.add('active'); var all = Object.keys(links), idx = all.indexOf(id); all.forEach(function (k, j) { links[k].classList.toggle('done', j < idx); }); }
      }
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  doc.querySelectorAll('main section[id]').forEach(function (s) { secIO.observe(s); });

  /* =================================================================
     LAB 1 · the bounded queue
     ================================================================= */
  function labQueue(host) {
    var CAP = 8192, SL = 32 * 2;
    host.innerHTML =
      '<div class="lab-row"><label>' + T.q.inRate + ' <output class="o1"></output><input type="range" class="r1" min="50" max="20000" step="50" value="1200"></label>' +
      '<label>' + T.q.outRate + ' <output class="o2"></output><input type="range" class="r2" min="500" max="20000" step="100" value="6000"></label></div>' +
      '<div class="chips"><button class="go b1">⚡ ' + T.q.burst + '</button><button class="b2">↺ ' + T.q.reset + '</button></div>' +
      '<div class="qlabels"><span>ETW callback → TryPush</span><span>EventQueue · 8192</span><span>PopBatch → writer</span></div>' +
      '<div class="qflow"></div><div class="qslots"></div>' +
      '<div class="readout"><div><b class="v1">0</b><span>' + T.q.offered + '</span></div><div class="good"><b class="v2">0</b><span>' + T.q.stored + '</span></div><div class="bad"><b class="v3">0</b><span>' + T.q.dropped + '</span></div><div><b class="v4">0</b><span>' + T.q.peak + '</span></div></div>' +
      '<p class="hint qmsg" style="margin:14px 0 0"></p>';
    var $ = function (s) { return host.querySelector(s); };
    var slots = $('.qslots'), flow = $('.qflow');
    for (var i = 0; i < SL; i++) slots.appendChild(doc.createElement('i'));
    var cells = slots.children, q = 0, off = 0, sto = 0, dro = 0, peak = 0, burst = 0, last = performance.now(), acc = 0, dots = [], vis = false;
    new IntersectionObserver(function (es) { vis = es[0].isIntersecting; }).observe(host);
    function out() { $('.o1').textContent = fmt(+$('.r1').value) + ' /s'; $('.o2').textContent = fmt(+$('.r2').value) + ' /s'; }
    $('.r1').oninput = out; $('.r2').oninput = out; out();
    $('.b1').onclick = function () { burst = 1.2; };
    $('.b2').onclick = function () { q = off = sto = dro = peak = 0; };
    (function tick(t) {
      var dt = Math.min(.05, (t - last) / 1000); last = t;
      if (vis) {
        var inR = +$('.r1').value + (burst > 0 ? 40000 : 0), outR = +$('.r2').value; burst -= dt;
        var add = inR * dt, before = q; off += add; q += add; var dropNow = 0;
        if (q > CAP) { dropNow = q - CAP; dro += dropNow; q = CAP; }
        var o = Math.min(q, outR * dt); q -= o; sto += o; peak = Math.max(peak, q);
        var f = Math.round(q / CAP * SL);
        for (i = 0; i < SL; i++) { cells[i].className = i < f ? 'f' : ''; }
        slots.classList.toggle('drop', dropNow > 0);
        $('.v1').textContent = fmt(off); $('.v2').textContent = fmt(sto); $('.v3').textContent = fmt(dro); $('.v4').textContent = fmt(peak);
        var m = $('.qmsg'); m.textContent = dropNow > 0 ? T.q.bad : T.q.ok; m.style.color = dropNow > 0 ? 'var(--crit)' : 'var(--muted)';
        acc += Math.min(inR, 4000) * dt / 120;
        while (acc > 1 && dots.length < 40) { acc--; var s = doc.createElement('span'); s.dataset.x = 0; s.dataset.x0 = 0; if (dropNow > 0 && Math.random() < .5) s.className = 'x'; flow.appendChild(s); dots.push(s); }
        var w = flow.clientWidth;
        for (i = dots.length - 1; i >= 0; i--) {
          var d = dots[i], x = +d.dataset.x + (motionOn ? 260 : 900) * dt; d.dataset.x = x;
          var lim = d.className === 'x' ? w * .5 : w;
          if (x > lim) { d.remove(); dots.splice(i, 1); continue; }
          d.style.left = x + 'px'; if (d.className === 'x' && x > w * .4) d.style.opacity = String(1 - (x - w * .4) / (w * .1));
        }
      }
      requestAnimationFrame(tick);
    })(last);
  }

  /* =================================================================
     LAB 2 · the rule engine, on eight real rules
     ================================================================= */
  function labRules(host) {
    var R = [
      { id: 'proc_creation_mshta_execution', t: 'Mshta Started', l: 'medium', sel: { selection: { Image: ['endswith', ['\\mshta.exe']] } }, c: 'selection' },
      { id: 'proc_creation_office_spawns_script_host', t: 'Office Application Started a Shell or Script Host', l: 'high', sel: { selection: { ParentImage: ['endswith', ['\\WINWORD.EXE', '\\EXCEL.EXE', '\\POWERPNT.EXE', '\\OUTLOOK.EXE', '\\MSACCESS.EXE', '\\VISIO.EXE']], Image: ['endswith', ['\\cmd.exe', '\\powershell.exe', '\\pwsh.exe', '\\wscript.exe', '\\cscript.exe', '\\mshta.exe', '\\rundll32.exe', '\\regsvr32.exe']] } }, c: 'selection' },
      { id: 'proc_creation_script_host_spawns_powershell', t: 'Script Host Started PowerShell', l: 'high', sel: { selection: { ParentImage: ['endswith', ['\\wscript.exe', '\\cscript.exe', '\\mshta.exe']], Image: ['endswith', ['\\powershell.exe', '\\pwsh.exe']] } }, c: 'selection' },
      { id: 'proc_creation_web_server_spawns_shell', t: 'Web Server Process Started a Shell or Recon Tool', l: 'high', sel: { selection: { ParentImage: ['endswith', ['\\w3wp.exe', '\\httpd.exe', '\\nginx.exe', '\\php-cgi.exe', '\\php.exe', '\\tomcat.exe', '\\tomcat8.exe', '\\tomcat9.exe', '\\tomcat10.exe', '\\UMWorkerProcess.exe']], Image: ['endswith', ['\\cmd.exe', '\\powershell.exe', '\\pwsh.exe', '\\wscript.exe', '\\cscript.exe', '\\mshta.exe', '\\whoami.exe', '\\net.exe', '\\net1.exe', '\\certutil.exe', '\\bitsadmin.exe', '\\rundll32.exe', '\\regsvr32.exe']] } }, c: 'selection' },
      { id: 'proc_creation_system_binary_masquerading', t: 'System Process Name Running From Outside the System Directory', l: 'high', sel: { selection: { Image: ['endswith', ['\\svchost.exe', '\\lsass.exe', '\\csrss.exe', '\\smss.exe', '\\wininit.exe', '\\winlogon.exe', '\\services.exe', '\\spoolsv.exe', '\\taskhostw.exe', '\\dllhost.exe', '\\conhost.exe']] }, filter_system: { Image: ['startswith', ['C:\\Windows\\System32\\', 'C:\\Windows\\SysWOW64\\', 'C:\\Windows\\WinSxS\\']] } }, c: 'selection and not filter_system' },
      { id: 'proc_creation_user_writable_location', t: 'Executable Started From a Temporary Directory', l: 'medium', sel: { selection: { Image: ['contains', ['\\AppData\\Local\\Temp\\', '\\Windows\\Temp\\']] }, filter_dism: { Image: ['endswith', ['\\DismHost.exe']] } }, c: 'selection and not filter_dism' },
      { id: 'proc_creation_public_or_programdata_location', t: 'Executable Started From Users\\Public or ProgramData', l: 'medium', sel: { selection: { Image: ['contains', ['\\Users\\Public\\', '\\ProgramData\\']] }, filter_windows: { Image: ['contains', ['\\ProgramData\\Microsoft\\', '\\ProgramData\\Package Cache\\']] } }, c: 'selection and not filter_windows' },
      { id: 'proc_creation_downloads_location', t: 'Executable Started From a Downloads Folder', l: 'low', sel: { selection: { Image: ['contains', ['\\Downloads\\']] } }, c: 'selection' }
    ];
    var parents = ['C:\\Windows\\explorer.exe', 'C:\\Program Files\\Microsoft Office\\root\\Office16\\WINWORD.EXE', 'C:\\Windows\\System32\\wscript.exe', 'C:\\Windows\\System32\\mshta.exe', 'C:\\xampp\\php\\php.exe', 'C:\\Windows\\System32\\services.exe', 'C:\\Windows\\System32\\cmd.exe'];
    var images = ['powershell.exe', 'cmd.exe', 'mshta.exe', 'svchost.exe', 'whoami.exe', 'rundll32.exe', 'notepad.exe', 'DismHost.exe', 'setup.exe'];
    var folders = ['C:\\Windows\\System32\\', 'C:\\Users\\alice\\AppData\\Local\\Temp\\', 'C:\\Users\\alice\\Downloads\\', 'C:\\Users\\Public\\', 'C:\\ProgramData\\Microsoft\\Windows Defender\\', 'C:\\ProgramData\\Updater\\', 'C:\\Program Files\\App\\'];
    var presets = FA ? [['سند فیشینگ', 1, 0, 0], ['وب‌شل', 4, 4, 0], ['svchost جعلی', 0, 3, 1], ['اجرا از Temp', 0, 8, 1], ['HTA', 0, 2, 0], ['عادی', 0, 6, 0]]
      : [['Phishing document', 1, 0, 0], ['Web shell', 4, 4, 0], ['Fake svchost', 0, 3, 1], ['Run from Temp', 0, 8, 1], ['HTA launch', 0, 2, 0], ['Normal', 0, 6, 0]];
    function opts(a, short) { return a.map(function (v, i) { return '<option value="' + i + '">' + (short ? v.split('\\').pop() : v) + '</option>'; }).join(''); }
    host.innerHTML = '<div class="chips">' + presets.map(function (p, i) { return '<button data-p="' + i + '">' + p[0] + '</button>'; }).join('') + '</div>' +
      '<div class="lab-row"><label>' + T.r.parent + '<select class="sp">' + opts(parents, true) + '</select></label>' +
      '<label>' + T.r.image + '<select class="si">' + opts(images) + '</select></label>' +
      '<label>' + T.r.folder + '<select class="sf">' + opts(folders) + '</select></label></div>' +
      '<div class="evt"></div><div class="rules"></div><p class="hint rmsg" style="margin:14px 0 0"></p>';
    var $ = function (s) { return host.querySelector(s); };
    function test(v, op, list) {
      v = v.toLowerCase();
      return list.some(function (x) { x = x.toLowerCase(); return op === 'endswith' ? v.slice(-x.length) === x : op === 'startswith' ? v.indexOf(x) === 0 : v.indexOf(x) >= 0; });
    }
    function run() {
      var ev = { Image: folders[$('.sf').value] + images[$('.si').value], ParentImage: parents[$('.sp').value] };
      $('.evt').innerHTML = '<span class="k">EventType:</span> <span class="v">ProcessStart</span><br><span class="k">Image:</span> <span class="v">' + ev.Image + '</span><br><span class="k">ParentImage:</span> <span class="v">' + ev.ParentImage + '</span>';
      var hits = 0;
      $('.rules').innerHTML = R.map(function (r) {
        var res = {}, chips = '';
        Object.keys(r.sel).forEach(function (k) { res[k] = Object.keys(r.sel[k]).every(function (f) { var s = r.sel[k][f]; return test(ev[f], s[0], s[1]); }); chips += '<em class="' + (res[k] ? 't' : 'f') + '">' + k + ' = ' + res[k] + '</em>'; });
        var hit = res.selection && Object.keys(res).every(function (k) { return k === 'selection' || !res[k]; });
        if (hit) hits++;
        return '<div class="rule' + (hit ? ' hit' : '') + '"><div class="rt"><span class="lvl">' + r.l + '</span><b>' + r.t + '</b><span class="st">' + (hit ? '● ' + T.r.match : T.r.none) + '</span></div><div class="cond"><span>condition: ' + r.c + '</span>' + chips + '</div></div>';
      }).join('');
      var m = $('.rmsg'); m.textContent = hits ? T.r.hits(hits) : T.r.noHit; m.style.color = hits ? 'var(--crit)' : 'var(--muted)';
    }
    ['.sp', '.si', '.sf'].forEach(function (s) { $(s).onchange = function () { host.querySelectorAll('[data-p]').forEach(function (b) { b.classList.remove('on'); }); run(); }; });
    host.querySelectorAll('[data-p]').forEach(function (b) {
      b.onclick = function () { var p = presets[+b.dataset.p]; $('.sp').value = p[1]; $('.si').value = p[2]; $('.sf').value = p[3]; host.querySelectorAll('[data-p]').forEach(function (x) { x.classList.toggle('on', x === b); }); run(); };
    });
    host.querySelector('[data-p="0"]').click();
  }

  /* =================================================================
     LAB 3 · the memory scanner, H1 + (H3 | H2 | H5)
     ================================================================= */
  function labMemory(host) {
    var base = [
      ['00007ff6a1e00000', 'IMAGE', 'RX', 'notepad.exe .text'],
      ['00007ffb3c100000', 'IMAGE', 'RX', 'ntdll.dll .text'],
      ['000001f2a0e00000', 'PRIVATE', 'RW', 'heap'],
      ['000000c8b5afc000', 'PRIVATE', 'RW+G', 'thread stack guard'],
      ['000001f2a1000000', 'MAPPED', 'R', 'locale.nls', 'file']
    ];
    var S = FA ? [
      ['notepad تمیز', [], 'clean'],
      ['برنامه‌ی .NET (JIT)', [['000001f2a3c00000', 'PRIVATE', 'RWX', 'CLR JIT code', '', ''], ['000001f2a3d10000', 'PRIVATE', 'RWX', 'CLR JIT stubs', '', ''], ['000001f2a3e20000', 'PRIVATE', 'RWX', 'CLR JIT code', '', '']], 'quiet'],
      ['PE injection (T1055.002)', [['000001f2a3b40000', 'PRIVATE', 'RWX', '4D 5A 90 00 … 50 45 00 00', 'pe', 'thread']], 'h1h3'],
      ['thread hijack (T1055.003)', [['000001f2a3b40000', 'PRIVATE', 'RX', 'FC 48 83 E4 F0 E8 C0 00', 'stub', '']], 'h1h5']
    ] : [
      ['Clean notepad', [], 'clean'],
      ['.NET app (JIT)', [['000001f2a3c00000', 'PRIVATE', 'RWX', 'CLR JIT code', '', ''], ['000001f2a3d10000', 'PRIVATE', 'RWX', 'CLR JIT stubs', '', ''], ['000001f2a3e20000', 'PRIVATE', 'RWX', 'CLR JIT code', '', '']], 'quiet'],
      ['PE injection (T1055.002)', [['000001f2a3b40000', 'PRIVATE', 'RWX', '4D 5A 90 00 … 50 45 00 00', 'pe', 'thread']], 'h1h3'],
      ['Thread hijack (T1055.003)', [['000001f2a3b40000', 'PRIVATE', 'RX', 'FC 48 83 E4 F0 E8 C0 00', 'stub', '']], 'h1h5']
    ];
    host.innerHTML = '<div class="chips">' + S.map(function (s, i) { return '<button data-s="' + i + '">' + s[0] + '</button>'; }).join('') + '<button class="go scanb">▶ ' + T.m.scan + '</button></div>' +
      '<div class="mmap"></div><div class="verdict">' + T.m.start + '</div>';
    var $ = function (s) { return host.querySelector(s); }, cur = 0, busy = false, regs = [];
    function load(i) {
      cur = i; host.querySelectorAll('[data-s]').forEach(function (b) { b.classList.toggle('on', +b.dataset.s === i); });
      regs = base.slice(0, 3).concat(S[i][1]).concat(base.slice(3));
      $('.mmap').innerHTML = regs.map(function (r) { return '<div class="mrow"><span class="addr">0x' + r[0] + '</span><span class="ty">' + r[1] + '</span><span class="pr">' + r[2] + '</span><span class="what">' + r[3] + '</span></div>'; }).join('');
      var v = $('.verdict'); v.className = 'verdict'; v.textContent = T.m.start;
    }
    function chip(row, cls, txt) { var s = doc.createElement('span'); s.className = 'sig ' + cls; s.textContent = txt; row.querySelector('.what').appendChild(s); }
    function scan() {
      if (busy) return; busy = true; load(cur); var rows = host.querySelectorAll('.mrow'), i = 0, found = [];
      $('.scanb').textContent = T.m.scanning;
      (function next() {
        rows.forEach(function (r) { r.classList.remove('scan'); });
        if (i >= rows.length) return finish(found);
        var r = regs[i], row = rows[i]; row.classList.add('scan');
        setTimeout(function () {
          if (r[2].indexOf('G') >= 0) chip(row, 'skip', T.m.skipG);
          else if (r[2].indexOf('X') < 0) chip(row, 'skip', T.m.noX);
          else if (r[1] === 'IMAGE') chip(row, 'skip', T.m.img);
          else if (r[1] === 'MAPPED' && r[4] === 'file') chip(row, 'skip', T.m.mapped);
          else {
            row.classList.add('h1'); chip(row, 'h1', 'H1'); var sig = ['H1'];
            if (r[2] === 'RWX') { chip(row, 'rwx', 'RWX'); sig.push('RWX'); }
            if (r[4] === 'pe') { chip(row, 'cor', 'H3 · PE header'); sig.push('H3'); }
            if (r[5] === 'thread') { chip(row, 'cor', 'H2 · thread start'); sig.push('H2'); }
            if (r[4] === 'stub') { chip(row, 'cor', 'H5 · shellcode stub'); sig.push('H5'); }
            if (sig.some(function (s) { return s === 'H3' || s === 'H2' || s === 'H5'; })) row.classList.add('rep');
            found.push({ base: r[0], sig: sig });
          }
          i++; setTimeout(next, motionOn ? 160 : 0);
        }, motionOn ? 260 : 0);
      })();
    }
    function finish(found) {
      busy = false; $('.scanb').textContent = '▶ ' + T.m.scan;
      var v = $('.verdict'), rep = found.filter(function (f) { return f.sig.some(function (s) { return s === 'H3' || s === 'H2' || s === 'H5'; }); });
      if (!found.length) { v.className = 'verdict quiet'; v.textContent = T.m.clean; return; }
      if (!rep.length) { v.className = 'verdict quiet'; v.textContent = T.m.quiet + ' (' + found.length + ' × H1+RWX)'; return; }
      var f = rep[0], has = function (s) { return f.sig.indexOf(s) >= 0; };
      var id = has('H3') ? 'lightedr-inj-h1h3' : has('H2') ? 'lightedr-inj-h1h2' : 'lightedr-inj-h1h5';
      var sev = has('RWX') || has('H2') ? 'critical' : 'high';
      v.className = 'verdict alert';
      v.innerHTML = '<b style="color:var(--crit)">ALERT</b> &nbsp;<code>' + id + '</code> · ' + sev + ' · T1055<br><code>Region=0x' + f.base + '; Signals=' + f.sig.join('+') + '</code>';
    }
    host.querySelectorAll('[data-s]').forEach(function (b) { b.onclick = function () { if (!busy) load(+b.dataset.s); }; });
    $('.scanb').onclick = scan; load(2);
  }

  doc.querySelectorAll('.lab[data-lab]').forEach(function (lab) {
    var body = lab.querySelector('.lab-run'), k = lab.dataset.lab;
    if (k === 'queue') labQueue(body); else if (k === 'rules') labRules(body); else if (k === 'memory') labMemory(body);
  });
})();
