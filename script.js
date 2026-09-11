/* MASJID AN-NOOR — night-sky mosque scene + page interactions (classic script) */
(function () {
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

  /* ---------- Three.js scene ---------- */
  if (!window.THREE) { document.body.classList.add('no-three'); return; }

  try {
    var renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg'), antialias: true, alpha: true });
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

    /* --- stylized low-poly mosque --- */
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

    /* --- crescent moon sprite --- */
    var cv = document.createElement('canvas'); cv.width = cv.height = 256;
    var g2 = cv.getContext('2d');
    g2.shadowColor = 'rgba(232,199,102,.9)'; g2.shadowBlur = 42;
    g2.fillStyle = '#E8C766';
    g2.beginPath(); g2.arc(128, 128, 86, 0, 7); g2.fill();
    g2.shadowBlur = 0;
    g2.globalCompositeOperation = 'destination-out';
    g2.beginPath(); g2.arc(162, 108, 76, 0, 7); g2.fill();
    var moon = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false
    }));
    moon.scale.set(7, 7, 1); moon.position.set(4.4, 3.6, -8);
    scene.add(moon);

    /* --- stars --- */
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

    /* --- drifting gold motes --- */
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

    /* --- interaction --- */
    var mx = 0, my = 0, tx = 0, ty = 0, scr = 0;
    addEventListener('mousemove', function (e) {
      tx = (e.clientX / innerWidth - .5) * 2;
      ty = -(e.clientY / innerHeight - .5) * 2;
    });
    addEventListener('scroll', function () { scr = scrollY; }, { passive: true });

    var clock = new THREE.Clock();
    function frame() {
      var t = clock.getElapsedTime();
      var dt = Math.min(clock.getDelta ? .016 : .016, .05);
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

    /* self-healing loop */
    var lastTick = performance.now(), rearmed = false;
    function tick(now) {
      lastTick = now; rearmed = false;
      try { frame(); } catch (e) {}
    }
    /* frame() self-schedules; watchdog re-arms if Chrome stalls it */
    setInterval(function () {
      if (document.visibilityState === 'visible' && performance.now() - lastTick > 1200 && !rearmed) {
        rearmed = true; requestAnimationFrame(frame);
      }
    }, 400);
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible' && !rearmed) { rearmed = true; requestAnimationFrame(frame); }
    });

    requestAnimationFrame(frame);

    addEventListener('resize', function () {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });
  } catch (e) {
    document.body.classList.add('no-three');
  }
})();