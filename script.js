/* MASJID AL-HILAL — night sky: Three.js if available, built-in Canvas 2D otherwise */
(function () {
  function dbg(s) { var d = document.getElementById('dbg'); if (d) d.textContent = s; }

  /* ---------- nav + reveals ---------- */
  var nav = document.querySelector('.nav');
  addEventListener('scroll', function () { nav.classList.toggle('scrolled', scrollY > 8); }, { passive: true });

  document.querySelectorAll('h2, .card, .ptime, .stat, .cta-card').forEach(function (el) { el.classList.add('reveal'); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .15 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- shared watchdog ---------- */
  var lastTick = performance.now(), rearmed = false, startLoop = null;
  function beat() { lastTick = performance.now(); rearmed = false; }
  function rearm() { if (startLoop && !rearmed) { rearmed = true; startLoop(); } }
  setInterval(function () {
    if (document.visibilityState === 'visible' && performance.now() - lastTick > 1200) rearm();
  }, 400);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') { lastTick = performance.now(); rearm(); }
  });
  addEventListener('focus', rearm);

  var canvas = document.getElementById('bg');

  if (window.THREE && canvas) {
    document.body.classList.add('three');
    try { initThree(); dbg('bg: 3D webgl'); }
    catch (e) {
      document.body.classList.remove('three');
      dbg('bg: 2D (3D failed: ' + e.message + ')');
      init2D();
    }
  } else {
    dbg('bg: 2D canvas (no three.js)');
    init2D();
  }

  /* ========== BUILT-IN 2D NIGHT ENGINE ========== */
  function init2D() {
    if (!canvas) { dbg('bg: css only (no canvas)'); return; }
    var ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) { dbg('bg: css only (no 2d ctx)'); return; }
    document.body.classList.add('twod');   /* hide CSS svg — canvas draws the mosque */
    var DPR = Math.min(window.devicePixelRatio || 1, 2), W, H;
    function rz() {
      W = canvas.width = innerWidth * DPR;
      H = canvas.height = innerHeight * DPR;
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
    }
    rz(); addEventListener('resize', rz);

    var stars = [], motes = [], i;
    for (i = 0; i < 220; i++) stars.push({
      x: Math.random(), y: Math.random() * .8,
      r: (Math.random() * 1.2 + .4) * DPR,
      ph: Math.random() * 6.28, sp: .5 + Math.random() * 1.5, g: i % 7 === 0
    });
    for (i = 0; i < 60; i++) motes.push({
      x: Math.random(), y: Math.random(), s: .02 + Math.random() * .05, w: Math.random() * 6.28
    });

    /* gold-outlined mosque, drawn with the same 2D context as the stars */
    function mosque(t) {
      var s = Math.min(W, H) / 700, cx = W / 2;
      ctx.save();
      ctx.strokeStyle = 'rgba(232,199,102,.9)';
      ctx.lineWidth = Math.max(1.5, 2 * s);
      ctx.fillStyle = 'rgba(4,16,30,.85)';
      ctx.shadowColor = 'rgba(232,199,102,.5)';
      ctx.shadowBlur = 12 * DPR;
      ctx.lineJoin = 'round';
      /* hall */
      ctx.beginPath(); ctx.rect(cx - 170 * s, H - 92 * s, 340 * s, 92 * s); ctx.fill(); ctx.stroke();
      /* dome */
      ctx.beginPath(); ctx.arc(cx, H - 92 * s, 100 * s, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      /* finial */
      ctx.beginPath();
      ctx.moveTo(cx - 3 * s, H - 190 * s); ctx.lineTo(cx - 3 * s, H - 214 * s);
      ctx.lineTo(cx + 3 * s, H - 214 * s); ctx.lineTo(cx + 3 * s, H - 190 * s);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, H - 218 * s, 6 * s, 0, 7); ctx.fill(); ctx.stroke();
      /* minarets */
      [-210, 210].forEach(function (dx) {
        ctx.beginPath(); ctx.rect(cx + (dx - 8) * s, H - 170 * s, 16 * s, 170 * s); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + dx * s, H - 170 * s, 16 * s, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      });
      ctx.shadowBlur = 0;
      /* glowing windows + door arch */
      [-34, 0, 34].forEach(function (dx, k) {
        ctx.fillStyle = 'rgba(232,199,102,' + (0.6 + 0.4 * Math.abs(Math.sin(t * 1.6 + k))) + ')';
        ctx.beginPath(); ctx.arc(cx + dx * s, H - 52 * s, 5 * s, 0, 7); ctx.fill();
      });
      ctx.fillStyle = 'rgba(232,199,102,.35)';
      ctx.beginPath(); ctx.arc(cx, H - 2 * s, 26 * s, Math.PI, 0); ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    function frame(now) {
      beat();
      var t = now / 1000;
      ctx.clearRect(0, 0, W, H);

      mosque(t);

      /* pulsing moon glow */
      var gx = W * .8, gy = H * .16, gr = (95 + Math.sin(t * .8) * 9) * DPR;
      var g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
      g.addColorStop(0, 'rgba(232,199,102,.5)');
      g.addColorStop(.5, 'rgba(232,199,102,.15)');
      g.addColorStop(1, 'rgba(232,199,102,0)');
      ctx.fillStyle = g;
      ctx.fillRect(gx - gr, gy - gr, gr * 2, gr * 2);

      /* twinkling stars */
      for (var k = 0; k < stars.length; k++) {
        var s = stars[k];
        var a = .25 + .75 * Math.abs(Math.sin(t * s.sp + s.ph));
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, 7);
        ctx.fillStyle = (s.g ? 'rgba(232,199,102,' : 'rgba(220,235,255,') + a + ')';
        ctx.fill();
      }

      /* rising gold motes */
      ctx.globalCompositeOperation = 'lighter';
      for (k = 0; k < motes.length; k++) {
        var m = motes[k];
        m.y -= m.s * .016;
        if (m.y < -.02) { m.y = 1.02; m.x = Math.random(); }
        ctx.beginPath();
        ctx.arc((m.x + Math.sin(t * .6 + m.w) * .012) * W, m.y * H, 1.1 * DPR, 0, 7);
        ctx.fillStyle = 'rgba(232,199,102,.55)';
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      requestAnimationFrame(frame);
    }
    startLoop = function () { requestAnimationFrame(frame); };
    startLoop();
  }

  /* ========== THREE.JS 3D NIGHT SCENE ========== */
  function initThree() {
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.setClearColor(0x071120, 1);

    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x071120, 14, 42);
    var camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, .1, 120);
    camera.position.set(0, 1.2, 9.5);

    var GOLD = 0xE8C766;
    function wire(geo, op) {
      return new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: op == null ? .85 : op })
      );
    }

    var mosque = new THREE.Group();
    var dome = wire(new THREE.SphereGeometry(1.7, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), .9);
    dome.position.y = 1.2; mosque.add(dome);
    var finial = wire(new THREE.ConeGeometry(.16, .7, 6), .9);
    finial.position.y = 3.2; mosque.add(finial);
    var tip = wire(new THREE.SphereGeometry(.1, 6, 4), .9);
    tip.position.y = 3.7; mosque.add(tip);
    var base = wire(new THREE.BoxGeometry(4.4, 1.2, 2.8), .7);
    base.position.y = .6; mosque.add(base);
    var door = wire(new THREE.BoxGeometry(.8, 1, .1), .8);
    door.position.set(0, .5, 1.42); mosque.add(door);
    [-2.9, 2.9].forEach(function (sx) {
      var shaft = wire(new THREE.CylinderGeometry(.16, .22, 3.4, 8), .8);
      shaft.position.set(sx, 1.7, 0); mosque.add(shaft);
      var balc = wire(new THREE.CylinderGeometry(.3, .3, .12, 8), .8);
      balc.position.set(sx, 2.5, 0); mosque.add(balc);
      var spire = wire(new THREE.ConeGeometry(.28, .9, 8), .85);
      spire.position.set(sx, 3.85, 0); mosque.add(spire);
      var bead = wire(new THREE.SphereGeometry(.08, 6, 4), .85);
      bead.position.set(sx, 4.4, 0); mosque.add(bead);
    });
    mosque.position.y = -1.5;
    scene.add(mosque);

    var cv = document.createElement('canvas'); cv.width = cv.height = 256;
    var g2 = cv.getContext('2d');
    g2.shadowColor = 'rgba(232,199,102,.9)'; g2.shadowBlur = 42;
    g2.fillStyle = '#E8C766';
    g2.beginPath(); g2.arc(128, 128, 86, 0, 7); g2.fill();
    g2.shadowBlur = 0;
    g2.globalCompositeOperation = 'destination-out';
    g2.beginPath(); g2.arc(162, 108, 76, 0, 7); g2.fill();
    var moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
    moon.scale.set(7, 7, 1); moon.position.set(4.4, 3.6, -8);
    scene.add(moon);

    var SN = 700, sp = new Float32Array(SN * 3);
    for (var i = 0; i < SN; i++) {
      var v = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * .9 + .08, Math.random() * 2 - 1)
        .normalize().multiplyScalar(20 + Math.random() * 18);
      sp[i*3] = v.x; sp[i*3+1] = v.y; sp[i*3+2] = v.z;
    }
    var sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    var stars = new THREE.Points(sGeo, new THREE.PointsMaterial({ color: 0xDCEBFF, size: .07, transparent: true, opacity: .85, depthWrite: false }));
    scene.add(stars);

    var MN = 130, mp = new Float32Array(MN * 3), mSpeed = [];
    for (i = 0; i < MN; i++) {
      mp[i*3] = (Math.random() - .5) * 12;
      mp[i*3+1] = Math.random() * 6 - 2;
      mp[i*3+2] = (Math.random() - .5) * 6;
      mSpeed.push(.08 + Math.random() * .18);
    }
    var mGeo = new THREE.BufferGeometry();
    mGeo.setAttribute('position', new THREE.BufferAttribute(mp, 3));
    scene.add(new THREE.Points(mGeo, new THREE.PointsMaterial({ color: GOLD, size: .05, transparent: true, opacity: .7, depthWrite: false, blending: THREE.AdditiveBlending })));

    var mx = 0, my = 0, tx = 0, ty = 0, scr = 0;
    addEventListener('mousemove', function (e) {
      tx = (e.clientX / innerWidth - .5) * 2;
      ty = -(e.clientY / innerHeight - .5) * 2;
    });
    addEventListener('scroll', function () { scr = scrollY; }, { passive: true });

    var clock = new THREE.Clock();
    function frame() {
      beat();
      var t = clock.getElapsedTime();
      mx += (tx - mx) * .04; my += (ty - my) * .04;

      mosque.rotation.y = Math.sin(t * .12) * .22 + mx * .3 + scr * .0004;
      mosque.position.y = -1.5 + Math.sin(t * .5) * .06;
      stars.rotation.y = t * .006;

      var p = mGeo.attributes.position.array;
      for (var i = 0; i < MN; i++) {
        p[i*3+1] += mSpeed[i] * .016;
        if (p[i*3+1] > 4.5) p[i*3+1] = -2;
      }
      mGeo.attributes.position.needsUpdate = true;

      camera.position.x = mx * .9;
      camera.position.y = 1.2 + my * .5 - scr * .0006;
      camera.lookAt(0, .5, 0);

      renderer.render(scene, camera);
      requestAnimationFrame(frame);
    }
    startLoop = function () { requestAnimationFrame(frame); };
    startLoop();

    addEventListener('resize', function () {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });
  }
})();