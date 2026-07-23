// La Dolce Vita Salon — shared site script: shader background (v2), smooth scroll, reveals, mobile nav.
(function () {
  // ---- Mobile nav toggle ----
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-nav-toggle]');
    if (t) {
      var links = document.querySelector('.nav-links');
      if (links) links.classList.toggle('open');
    }
  });

  // ---- Failsafe: never leave content hidden ----
  var failsafe = setTimeout(function () {
    document.querySelectorAll('.reveal').forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; });
  }, 1400);

  // ---- Shader background (locked v2 settings) ----
  function mountShader() {
    var host = document.createElement('div');
    host.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:-1;background:#F5F3EF;';
    document.body.appendChild(host);
    var props = {
      animate: 'on', brightness: 1, cAzimuthAngle: 170, cDistance: 3.5, cPolarAngle: 70,
      cameraZoom: 2, color1: '#F2F2F2', color2: '#F5F3EF', color3: '#B08D57',
      envPreset: 'city', fov: 27, frameRate: 10, grain: 'off', lightType: '3d',
      positionX: 0, positionY: 0, positionZ: -0.3, range: 'disabled', rangeEnd: 40, rangeStart: 0,
      reflection: 0.1, rotationX: 45, rotationY: 0, rotationZ: 0, shader: 'defaults', type: 'waterPlane',
      uAmplitude: 4.3, uDensity: 3, uFrequency: 0, uSpeed: 0.1, uStrength: 1.4, uTime: 0, wireframe: false
    };
    var url = 'https://esm.sh/@shadergradient/react@2.0.0?deps=react@18.2.0,react-dom@18.2.0,@react-three/fiber@8.17.10,three@0.160.0';
    var tries = 0;
    function load() {
      Promise.all([
        import('https://esm.sh/react@18.2.0'),
        import('https://esm.sh/react-dom@18.2.0/client'),
        import(url)
      ]).then(function (mods) {
        var React = mods[0].default, createRoot = mods[1].createRoot, sg = mods[2];
        createRoot(host).render(
          React.createElement(sg.ShaderGradientCanvas,
            { style: { position: 'absolute', inset: 0, width: '100%', height: '100%' }, pixelDensity: 1.4, fov: 70 },
            React.createElement(sg.ShaderGradient, props))
        );
      }).catch(function () { if (tries++ < 1) setTimeout(load, 800); });
    }
    load();
  }

  // ---- GSAP + Lenis + reveals ----
  function initMotion() {
    if (!window.gsap || !window.ScrollTrigger) { setTimeout(initMotion, 60); return; }
    gsap.registerPlugin(ScrollTrigger);

    setTimeout(function () {
      if (gsap.ticker.frame > 1) { if (failsafe) { clearTimeout(failsafe); failsafe = null; } }
      else { document.querySelectorAll('.reveal').forEach(function (el) { el.style.opacity = '1'; el.style.transform = 'none'; }); }
    }, 900);

    if (window.Lenis) {
      var lenis = new Lenis({ duration: 1.2, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0, 0);
    }

    var heroEls = document.querySelectorAll('.hero-el');
    if (heroEls.length) gsap.fromTo(heroEls, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.09, delay: 0.15 });

    document.querySelectorAll('.fx').forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    document.querySelectorAll('.parallax-img').forEach(function (img) {
      gsap.to(img, { yPercent: -8, ease: 'none', scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    document.querySelectorAll('.ldv-magnet').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.35, y: (e.clientY - r.top - r.height / 2) * 0.4, duration: 0.4 });
      });
      btn.addEventListener('mouseleave', function () { gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,.4)' }); });
    });
  }

  function start() { mountShader(); initMotion(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
