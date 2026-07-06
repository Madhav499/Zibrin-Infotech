/**
 * ═══════════════════════════════════════════════════════════
 * ZIBRIN INFOTECH | app.js v4 (Ultimate 3D Storytelling)
 * GSAP · Three.js · Viewport-Based Rendering Observer
 * ═══════════════════════════════════════════════════════════
 */

window.addEventListener('load', () => {

  /* Register GSAP plugins */
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create('easeOut', '0.16, 1, 0.3, 1');

  /* ══════════════════════════════════════
     1. LOADER & TRANSITION
  ══════════════════════════════════════ */
  const loader    = document.getElementById('loader');
  const loaderBar = document.getElementById('loaderBar');
  const loaderPct = document.getElementById('loaderPct');

  /* Draw SVG logo Zenith path */
  const lp1 = document.getElementById('lp1');
  if (lp1) {
    const len = lp1.getTotalLength();
    lp1.style.strokeDasharray  = len;
    lp1.style.strokeDashoffset = len;
    gsap.to(lp1, { strokeDashoffset: 0, duration: 1.5, ease: 'power3.inOut' });
  }

  /* Progress counter */
  let progress = { val: 0 };
  gsap.to(progress, {
    val: 100,
    duration: 2.6,
    ease: 'power2.inOut',
    onUpdate() {
      const v = Math.round(progress.val);
      if (loaderBar) loaderBar.style.width = v + '%';
      if (loaderPct) loaderPct.textContent  = v + '%';
    },
    onComplete() {
      gsap.to(loader, {
        opacity: 0,
        duration: 0.9,
        delay: 0.3,
        ease: 'power3.inOut',
        onComplete() {
          loader.classList.add('hidden');
          initApp();
        }
      });
    }
  });

  /* ══════════════════════════════════════
     CORE INITIALIZATION
  ══════════════════════════════════════ */
  function initApp() {
    initLenis();
    initCursor();
    initNavbar();
    initMenu();

    // Init WebGL Viewport Observer Engine
    initWebGLObserver();

    initHeroAnimation();
    initScrollReveal();
    initWorkflow();
    initServicesAccordion();
    initTiltCards();
    initMagneticBtns();
    initCounters();
    initFAQ();
    initContactForm();
    initAIChat();
    initIndustriesMarquee();
  }

  /* ══════════════════════════════════════
     2. LENIS SMOOTH SCROLL
  ══════════════════════════════════════ */
  function initLenis() {
    const lenis = new Lenis({
      duration: 1.4,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothTouch: false,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          lenis.scrollTo(target, { offset: -80, duration: 1.8 });
          if (menuOpen) closeMenu();
        }
      });
    });

    window._lenis = lenis;
  }

  /* ══════════════════════════════════════
     3. UPGRADED CUSTOM CURSOR WITH TRAIL
  ══════════════════════════════════════ */
  function initCursor() {
    const dot   = document.getElementById('cursorDot');
    const ring  = document.getElementById('cursorRing');
    const label = document.getElementById('cursorLabel');
    if (!dot || !ring) return;

    let mx = 0, my = 0;
    let dx = 0, dy = 0;
    let rx = 0, ry = 0;

    const trails = [];
    const trailCount = 8;
    for (let i = 0; i < trailCount; i++) {
      const t = document.createElement('div');
      t.className = 'cursor-trail-dot';
      t.style.cssText = `
        position: fixed; top: 0; left: 0; width: 4px; height: 4px;
        background: #00e5ff; opacity: ${0.5 - (i / trailCount) * 0.4};
        border-radius: 50%; pointer-events: none; z-index: 9998;
        transform: translate(-50%, -50%); will-change: transform;
      `;
      document.body.appendChild(t);
      trails.push({ el: t, x: 0, y: 0 });
    }

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    (function raf() {
      dx += (mx - dx) * 0.8;
      dy += (my - dy) * 0.8;
      rx += (mx - rx) * 0.08;
      ry += (my - ry) * 0.08;

      dot.style.left  = dx + 'px';
      dot.style.top   = dy + 'px';
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';

      let px = dx;
      let py = dy;
      trails.forEach((t, i) => {
        t.x += (px - t.x) * 0.4;
        t.y += (py - t.y) * 0.4;
        t.el.style.transform = `translate(${t.x}px, ${t.y}px)`;
        px = t.x;
        py = t.y;
      });

      if (label && label.style.opacity !== '0') {
        label.style.left = rx + 'px';
        label.style.top  = (ry - 44) + 'px';
      }

      requestAnimationFrame(raf);
    })();

    document.querySelectorAll('a, button, [data-magnetic], .scat-btn, .faq-q, details summary').forEach(el => {
      el.addEventListener('mouseenter', () => {
        const text = el.getAttribute('data-cursor-text') || '';
        document.body.setAttribute('data-cursor', text ? 'project' : 'hover');
        if (label) {
          label.textContent = text;
          label.style.opacity = text ? '1' : '0';
        }
      });
      el.addEventListener('mouseleave', () => {
        document.body.setAttribute('data-cursor', 'default');
        if (label) label.style.opacity = '0';
      });
    });
  }

  /* ══════════════════════════════════════
     4. NAVBAR & MENU
  ══════════════════════════════════════ */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    gsap.to(['.nav-logo', '.nav-center-links', '.nav-right'], {
      opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'easeOut', delay: 0.2
    });
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
    document.getElementById('navToggle')?.addEventListener('click', toggleMenu);
  }

  const menuOverlay = document.getElementById('menuOverlay');
  const navToggle   = document.getElementById('navToggle');
  let menuOpen = false;

  function toggleMenu() { menuOpen ? closeMenu() : openMenu(); }

  function openMenu() {
    menuOpen = true;
    menuOverlay.classList.add('open');
    navToggle?.classList.add('active');
    document.body.style.overflow = 'hidden';
    gsap.fromTo('.menu-link',
      { opacity: 0, x: -48 },
      { opacity: 1, x: 0, stagger: .06, duration: .65, ease: 'easeOut', delay: .2 }
    );
  }

  function closeMenu() {
    menuOpen = false;
    menuOverlay.classList.remove('open');
    navToggle?.classList.remove('active');
    document.body.style.overflow = '';
  }

  function initMenu() {
    menuOverlay?.addEventListener('click', e => { if (e.target === menuOverlay) closeMenu(); });
  }

  /* ══════════════════════════════════════
     5. WEBGL OBSERVER ENGINE
  ══════════════════════════════════════ */
  const activeScenes = {};

  function initWebGLObserver() {
    const canvases = document.querySelectorAll('canvas');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        if (entry.isIntersecting) {
          if (!activeScenes[id]) {
            compileScene(id);
          } else {
            activeScenes[id].running = true;
            activeScenes[id].animate();
          }
        } else {
          if (activeScenes[id]) {
            activeScenes[id].running = false;
          }
        }
      });
    }, { threshold: 0.1 });

    canvases.forEach(c => observer.observe(c));
  }

  function compileScene(id) {
    const canvas = document.getElementById(id);
    if (!canvas) return;

    // Detect WebGL
    try {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) { fallbackScene2D(id); return; }
    } catch(e) { fallbackScene2D(id); return; }

    const scene = new THREE.Scene();
    const width = canvas.clientWidth || window.innerWidth;
    const height = canvas.clientHeight || window.innerHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.z = 80;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    activeScenes[id] = { scene, camera, renderer, running: true, clock: new THREE.Clock() };

    // Setup specific animations
    if (id === 'heroCanvas') setupHeroWorkstation(activeScenes[id]);
    else if (id === 'developerCanvas') setupDeveloperHuman(activeScenes[id]);
    else if (id === 'servicesCanvas') setupServicesVisuals(activeScenes[id]);
    else if (id === 'stackCanvas') setupTechnologyGalaxy(activeScenes[id]);
    else if (id === 'workflowCanvas') setupWorkflowPipeline(activeScenes[id]);
    else if (id === 'seoCanvas') setupSEOGenerator(activeScenes[id]);
    else if (id === 'cloudCanvas') setupCloudClusters(activeScenes[id]);
    else if (id === 'securityCanvas') setupSecurityShield(activeScenes[id]);
    else if (id === 'aiCanvas') setupNeuralBrain(activeScenes[id]);
    else if (id === 'footerCanvas') setupFooterOrb(activeScenes[id]);
  }

  function fallbackScene2D(id) {
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext('2d');
    let w = canvas.width = canvas.clientWidth || 300;
    let h = canvas.height = canvas.clientHeight || 200;
    
    function draw() {
      if (activeScenes[id] && !activeScenes[id].running) return;
      ctx.clearRect(0,0,w,h);
      ctx.strokeStyle = 'rgba(0,229,255,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, w - 20, h - 20);
      requestAnimationFrame(draw);
    }
    activeScenes[id] = { running: true, animate: draw };
    draw();
  }

  /* ══════════════════════════════════════
     6. HERO: FUTURISTIC WORKSTATION
  ══════════════════════════════════════ */
  let heroMouseX = 0, heroMouseY = 0;
  document.addEventListener('mousemove', e => {
    heroMouseX = (e.clientX - window.innerWidth / 2) * 0.04;
    heroMouseY = (e.clientY - window.innerHeight / 2) * 0.04;
  });

  function setupHeroWorkstation(inst) {
    const { scene, camera, renderer, clock } = inst;
    camera.position.set(0, 5, 90);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Futuristic Curved Desk Layout
    const deskGeom = new THREE.BoxGeometry(40, 1, 20);
    const deskMat = new THREE.MeshBasicMaterial({ color: '#0a1229', transparent: true, opacity: 0.85, wireframe: true });
    const desk = new THREE.Mesh(deskGeom, deskMat);
    desk.position.y = -12;
    mainGroup.add(desk);

    // 2. Triple-monitor setup mesh
    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(0, -2, -4);
    mainGroup.add(monitorGroup);

    const monColors = ['#7c3aed', '#00e5ff', '#7c3aed'];
    const angles = [-0.3, 0, 0.3];
    const positionsX = [-18, 0, 18];

    for(let i=0; i<3; i++) {
      const monGeom = new THREE.PlaneGeometry(15, 9);
      const monMat = new THREE.MeshBasicMaterial({ color: monColors[i], wireframe: true, transparent: true, opacity: 0.25 });
      const mon = new THREE.Mesh(monGeom, monMat);
      mon.position.x = positionsX[i];
      mon.rotation.y = angles[i];
      monitorGroup.add(mon);
    }

    // 3. Holographic floating screens
    const holoGeom = new THREE.RingGeometry(8, 9, 32);
    const holoMat = new THREE.MeshBasicMaterial({ color: '#10b981', side: THREE.DoubleSide, transparent: true, opacity: 0.15 });
    const holoRing = new THREE.Mesh(holoGeom, holoMat);
    holoRing.position.set(0, 12, -8);
    mainGroup.add(holoRing);

    // 4. Volumetric Core/Brain above workstation
    const particleCount = 400;
    const partGeom = new THREE.BufferGeometry();
    const partPos = new Float32Array(particleCount * 3);
    for(let i=0; i<particleCount; i++) {
      const radius = 6 + Math.random() * 4;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(Math.random() * 2 - 1);
      partPos[i*3] = radius * Math.sin(p) * Math.cos(t);
      partPos[i*3+1] = radius * Math.sin(p) * Math.sin(t) + 12;
      partPos[i*3+2] = radius * Math.cos(p) - 8;
    }
    partGeom.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
    const partMat = new THREE.PointsMaterial({ color: '#00e5ff', size: 0.5, transparent: true, opacity: 0.6 });
    const particles = new THREE.Points(partGeom, partMat);
    mainGroup.add(particles);

    inst.animate = function() {
      if (!inst.running) return;
      requestAnimationFrame(inst.animate);
      const elapsed = clock.getElapsedTime();

      // Slow rotating desk and workspace
      mainGroup.rotation.y = elapsed * 0.08;
      particles.rotation.x = elapsed * 0.12;
      holoRing.rotation.z = -elapsed * 0.15;

      // Mouse skew camera controls
      camera.position.x += (heroMouseX - camera.position.x) * 0.05;
      camera.position.y += (-heroMouseY + 5 - camera.position.y) * 0.05;
      camera.lookAt(new THREE.Vector3(0, 0, 0));

      renderer.render(scene, camera);
    };
    inst.animate();
  }

  /* ══════════════════════════════════════
     7. STYLIZED CODING HUMAN (About Section)
  ══════════════════════════════════════ */
  function setupDeveloperHuman(inst) {
    const { scene, camera, renderer, clock } = inst;
    camera.position.set(0, 0, 60);

    const devGroup = new THREE.Group();
    scene.add(devGroup);

    // Volumetric coding human wireframe body
    const bodyGeom = new THREE.CylinderGeometry(4, 6, 12, 8, 4, true);
    const wireMat = new THREE.MeshBasicMaterial({ color: '#7c3aed', wireframe: true, transparent: true, opacity: 0.35 });
    const body = new THREE.Mesh(bodyGeom, wireMat);
    body.position.y = -6;
    devGroup.add(body);

    // Head
    const headGeom = new THREE.SphereGeometry(3, 8, 8);
    const head = new THREE.Mesh(headGeom, wireMat);
    head.position.y = 4;
    devGroup.add(head);

    // Floating UI panes (coding screens)
    const floatGeom = new THREE.PlaneGeometry(10, 6);
    const floatMat = new THREE.MeshBasicMaterial({ color: '#00e5ff', wireframe: true, transparent: true, opacity: 0.25 });
    const leftScreen = new THREE.Mesh(floatGeom, floatMat);
    leftScreen.position.set(-12, 2, 8);
    leftScreen.rotation.y = 0.4;
    devGroup.add(leftScreen);

    const rightScreen = new THREE.Mesh(floatGeom, floatMat);
    rightScreen.position.set(12, 2, 8);
    rightScreen.rotation.y = -0.4;
    devGroup.add(rightScreen);

    inst.animate = function() {
      if (!inst.running) return;
      requestAnimationFrame(inst.animate);
      const elapsed = clock.getElapsedTime();

      // Humanoid typing micro-movements
      head.position.y = 4 + Math.sin(elapsed * 2.5) * 0.15;
      leftScreen.position.y = 2 + Math.cos(elapsed * 1.5) * 0.25;
      rightScreen.position.y = 2 + Math.sin(elapsed * 1.5) * 0.25;

      devGroup.rotation.y = Math.sin(elapsed * 0.3) * 0.15;

      renderer.render(scene, camera);
    };
    inst.animate();
  }

  /* ══════════════════════════════════════
     8. SERVICES VISUALS (Morphing Canvas)
  ══════════════════════════════════════ */
  let activeServiceMesh = 'web';
  window._setServicesVisualState = function(state) {
    activeServiceMesh = state;
  };

  function setupServicesVisuals(inst) {
    const { scene, camera, renderer, clock } = inst;
    camera.position.set(0, 0, 50);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Browser wireframe
    const browserGroup = new THREE.Group();
    rootGroup.add(browserGroup);
    const bOutline = new THREE.Mesh(new THREE.BoxGeometry(22, 14, 2), new THREE.MeshBasicMaterial({ color: '#00e5ff', wireframe: true, transparent: true, opacity: 0.4 }));
    browserGroup.add(bOutline);
    // Inner layers
    const bLayer = new THREE.Mesh(new THREE.PlaneGeometry(20, 12), new THREE.MeshBasicMaterial({ color: '#7c3aed', wireframe: true, transparent: true, opacity: 0.15 }));
    bLayer.position.z = 0.5;
    browserGroup.add(bLayer);

    // 2. Phone wireframe
    const phoneGroup = new THREE.Group();
    rootGroup.add(phoneGroup);
    const pOutline = new THREE.Mesh(new THREE.BoxGeometry(10, 20, 2), new THREE.MeshBasicMaterial({ color: '#7c3aed', wireframe: true, transparent: true, opacity: 0.4 }));
    phoneGroup.add(pOutline);
    const pScreen = new THREE.Mesh(new THREE.PlaneGeometry(9, 18), new THREE.MeshBasicMaterial({ color: '#00e5ff', wireframe: true, transparent: true, opacity: 0.15 }));
    pScreen.position.z = 0.5;
    phoneGroup.add(pScreen);

    // 3. ERP Diagram nodes
    const erpGroup = new THREE.Group();
    rootGroup.add(erpGroup);
    const nodes = [];
    for(let i=0; i<5; i++) {
      const sp = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), new THREE.MeshBasicMaterial({ color: '#10b981', wireframe: true }));
      sp.position.set((i - 2) * 6, Math.sin(i) * 3, 0);
      erpGroup.add(sp);
      nodes.push(sp);
    }

    inst.animate = function() {
      if (!inst.running) return;
      requestAnimationFrame(inst.animate);
      const elapsed = clock.getElapsedTime();

      // Show/Hide depending on active state
      if (activeServiceMesh === 'web' || activeServiceMesh === 'ecom') {
        browserGroup.visible = true;
        phoneGroup.visible = false;
        erpGroup.visible = false;
        browserGroup.rotation.y = elapsed * 0.3;
        browserGroup.position.y = Math.sin(elapsed * 1.5) * 0.8;
      } else if (activeServiceMesh === 'mobile') {
        browserGroup.visible = false;
        phoneGroup.visible = true;
        erpGroup.visible = false;
        phoneGroup.rotation.y = elapsed * 0.4;
        phoneGroup.rotation.x = Math.sin(elapsed * 0.8) * 0.2;
      } else {
        // ERP / Custom Software / Other
        browserGroup.visible = false;
        phoneGroup.visible = false;
        erpGroup.visible = true;
        erpGroup.rotation.z = elapsed * 0.1;
        nodes.forEach((n, idx) => {
          n.position.y = Math.sin(elapsed * 2.0 + idx) * 3.5;
        });
      }

      renderer.render(scene, camera);
    };
    inst.animate();
  }

  /* ══════════════════════════════════════
     9. TECHNOLOGY GALAXY (Tech Stack)
  ══════════════════════════════════════ */
  function setupTechnologyGalaxy(inst) {
    const { scene, camera, renderer, clock } = inst;
    camera.position.set(0, 0, 70);

    const galaxy = new THREE.Group();
    scene.add(galaxy);

    // Central pulsing star (ZIBRIN CORE)
    const coreGeom = new THREE.SphereGeometry(6, 12, 12);
    const coreMat = new THREE.MeshBasicMaterial({ color: '#00e5ff', wireframe: true });
    const core = new THREE.Mesh(coreGeom, coreMat);
    galaxy.add(core);

    // Concentric orbits
    const orbits = [16, 26, 36, 46];
    const orbitColors = ['#7c3aed', '#10b981', '#00e5ff', '#7c3aed'];

    orbits.forEach((r, idx) => {
      const ringGeom = new THREE.RingGeometry(r, r + 0.2, 64);
      const ringMat = new THREE.MeshBasicMaterial({ color: orbitColors[idx], side: THREE.DoubleSide, transparent: true, opacity: 0.15 });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = Math.PI * 0.45;
      galaxy.add(ring);
    });

    inst.animate = function() {
      if (!inst.running) return;
      requestAnimationFrame(inst.animate);
      const elapsed = clock.getElapsedTime();

      galaxy.rotation.y = elapsed * 0.05;
      core.scale.setScalar(1 + Math.sin(elapsed * 2.2) * 0.08);

      renderer.render(scene, camera);
    };
    inst.animate();
  }

  /* ══════════════════════════════════════
     10. WORKFLOW ENGINEERING PIPELINE
  ══════════════════════════════════════ */
  function setupWorkflowPipeline(inst) {
    const { scene, camera, renderer, clock } = inst;
    camera.position.set(0, 0, 50);

    const pipeGroup = new THREE.Group();
    scene.add(pipeGroup);

    // Pipeline track mesh (Helix)
    const helixPoints = [];
    for (let i = 0; i < 100; i++) {
      const angle = (i / 100) * Math.PI * 8;
      const y = (i / 100) * 20 - 10;
      helixPoints.push(new THREE.Vector3(Math.cos(angle) * 8, y, Math.sin(angle) * 8));
    }
    const pathGeom = new THREE.BufferGeometry().setFromPoints(helixPoints);
    const pathMat = new THREE.LineBasicMaterial({ color: '#7c3aed', transparent: true, opacity: 0.3 });
    const helixLine = new THREE.Line(pathGeom, pathMat);
    pipeGroup.add(helixLine);

    // Pulsing data packet traversing down the pipeline
    const packetGeom = new THREE.SphereGeometry(0.8, 8, 8);
    const packetMat = new THREE.MeshBasicMaterial({ color: '#00e5ff', wireframe: true });
    const packet = new THREE.Mesh(packetGeom, packetMat);
    pipeGroup.add(packet);

    inst.animate = function() {
      if (!inst.running) return;
      requestAnimationFrame(inst.animate);
      const elapsed = clock.getElapsedTime();

      pipeGroup.rotation.y = elapsed * 0.2;

      // Calculate path traversal position
      const progress = (elapsed * 0.15) % 1;
      const idx = Math.floor(progress * helixPoints.length);
      if (helixPoints[idx]) {
        packet.position.copy(helixPoints[idx]);
      }

      renderer.render(scene, camera);
    };
    inst.animate();
  }

  /* ══════════════════════════════════════
     11. SEO / AEO / GEO GENERATIVE ORBITS
  ══════════════════════════════════════ */
  function setupSEOGenerator(inst) {
    const { scene, camera, renderer, clock } = inst;
    camera.position.set(0, 0, 60);

    const seoGroup = new THREE.Group();
    scene.add(seoGroup);

    // Central SEO/AEO/GEO core
    const hub = new THREE.Mesh(new THREE.IcosahedronGeometry(4, 1), new THREE.MeshBasicMaterial({ color: '#00e5ff', wireframe: true }));
    seoGroup.add(hub);

    // Orbiting Satellite Nodes: Google, ChatGPT, Gemini, Perplexity
    const sats = [];
    const colors = ['#7c3aed', '#10b981', '#00e5ff', '#7c3aed'];
    const distances = [12, 18, 24, 30];

    for(let i=0; i<4; i++) {
      const orbitRing = new THREE.Mesh(new THREE.RingGeometry(distances[i], distances[i] + 0.15, 64), new THREE.MeshBasicMaterial({ color: colors[i], side: THREE.DoubleSide, transparent: true, opacity: 0.1 }));
      orbitRing.rotation.x = Math.PI * 0.4;
      seoGroup.add(orbitRing);

      const satMesh = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), new THREE.MeshBasicMaterial({ color: colors[i], wireframe: true }));
      seoGroup.add(satMesh);
      sats.push({ mesh: satMesh, dist: distances[i], speed: 0.2 + i*0.1 });
    }

    inst.animate = function() {
      if (!inst.running) return;
      requestAnimationFrame(inst.animate);
      const elapsed = clock.getElapsedTime();

      seoGroup.rotation.y = elapsed * 0.05;
      hub.rotation.x = elapsed * 0.1;

      sats.forEach(s => {
        const angle = elapsed * s.speed;
        s.mesh.position.set(Math.cos(angle) * s.dist, Math.sin(angle) * s.dist * 0.3, Math.sin(angle) * s.dist * 0.8);
      });

      renderer.render(scene, camera);
    };
    inst.animate();
  }

  /* ══════════════════════════════════════
     12. CLOUD INFRASTRUCTURE CLUSTERS
  ══════════════════════════════════════ */
  function setupCloudClusters(inst) {
    const { scene, camera, renderer, clock } = inst;
    camera.position.set(0, 0, 50);

    const cloudGroup = new THREE.Group();
    scene.add(cloudGroup);

    // Floating server stack layers (boxes)
    const servers = [];
    for(let i=0; i<3; i++) {
      const box = new THREE.Mesh(new THREE.BoxGeometry(16, 2.5, 10), new THREE.MeshBasicMaterial({ color: '#7c3aed', wireframe: true, transparent: true, opacity: 0.3 }));
      box.position.y = (i - 1) * 6;
      cloudGroup.add(box);
      servers.push(box);
    }

    inst.animate = function() {
      if (!inst.running) return;
      requestAnimationFrame(inst.animate);
      const elapsed = clock.getElapsedTime();

      cloudGroup.rotation.y = elapsed * 0.08;
      servers.forEach((s, idx) => {
        s.position.x = Math.sin(elapsed + idx) * 0.5;
      });

      renderer.render(scene, camera);
    };
    inst.animate();
  }

  /* ══════════════════════════════════════
     13. CYBER SECURITY SHIELD
  ══════════════════════════════════════ */
  function setupSecurityShield(inst) {
    const { scene, camera, renderer, clock } = inst;
    camera.position.set(0, 0, 50);

    const secGroup = new THREE.Group();
    scene.add(secGroup);

    // Central secure database node
    const dbCore = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 6, 8), new THREE.MeshBasicMaterial({ color: '#10b981', wireframe: true }));
    secGroup.add(dbCore);

    // Digital rotating firewall shield dome
    const shield = new THREE.Mesh(new THREE.SphereGeometry(10, 16, 16, 0, Math.PI*2, 0, Math.PI*0.5), new THREE.MeshBasicMaterial({ color: '#00e5ff', wireframe: true, transparent: true, opacity: 0.2 }));
    shield.rotation.x = Math.PI * 0.55;
    secGroup.add(shield);

    inst.animate = function() {
      if (!inst.running) return;
      requestAnimationFrame(inst.animate);
      const elapsed = clock.getElapsedTime();

      secGroup.rotation.y = elapsed * 0.15;
      shield.rotation.y = -elapsed * 0.3;
      dbCore.position.y = Math.sin(elapsed * 2.0) * 0.4;

      renderer.render(scene, camera);
    };
    inst.animate();
  }

  /* ══════════════════════════════════════
     14. AI NEURAL BRAIN
  ══════════════════════════════════════ */
  function setupNeuralBrain(inst) {
    const { scene, camera, renderer, clock } = inst;
    camera.position.set(0, 0, 45);

    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    // Volumetric node sphere representing brain
    const nodeCount = 140;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(nodeCount * 3);
    const nodes = [];

    for(let i=0; i<nodeCount; i++) {
      // Shape brain hemispheres (left/right spheres)
      const isLeft = Math.random() > 0.5;
      const offsetX = isLeft ? -3.5 : 3.5;
      const r = Math.random() * 7;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(Math.random() * 2 - 1);

      positions[i*3] = r * Math.sin(p) * Math.cos(t) + offsetX;
      positions[i*3+1] = r * Math.sin(p) * Math.sin(t);
      positions[i*3+2] = r * Math.cos(p);
      
      nodes.push(new THREE.Vector3(positions[i*3], positions[i*3+1], positions[i*3+2]));
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: '#7c3aed', size: 0.65, transparent: true, opacity: 0.8 });
    const points = new THREE.Points(geometry, mat);
    brainGroup.add(points);

    // Connect nodes via synapse line grids
    const lineMat = new THREE.LineBasicMaterial({ color: '#00e5ff', transparent: true, opacity: 0.1 });
    const lineGeom = new THREE.BufferGeometry();
    const lines = new THREE.LineSegments(lineGeom, lineMat);
    brainGroup.add(lines);

    inst.animate = function() {
      if (!inst.running) return;
      requestAnimationFrame(inst.animate);
      const elapsed = clock.getElapsedTime();

      brainGroup.rotation.y = elapsed * 0.08;

      // Animate line synapse segment connection updates
      const linePositions = [];
      for(let i=0; i<nodeCount; i+=2) {
        for(let j=i+1; j<nodeCount; j+=3) {
          if (nodes[i].distanceTo(nodes[j]) < 8) {
            linePositions.push(nodes[i].x, nodes[i].y, nodes[i].z);
            linePositions.push(nodes[j].x, nodes[j].y, nodes[j].z);
          }
        }
      }
      lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      lineGeom.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    window._triggerSynapsePulse = function() {
      gsap.to(lineMat, { opacity: 0.8, duration: 0.25, yoyo: true, repeat: 1 });
    };

    inst.animate();
  }

  /* ══════════════════════════════════════
     15. FOOTER DIGITAL ENERGY ORB
  ══════════════════════════════════════ */
  function setupFooterOrb(inst) {
    const { scene, camera, renderer, clock } = inst;
    camera.position.set(0, 0, 50);

    const geom = new THREE.IcosahedronGeometry(15, 2);
    const mat = new THREE.MeshBasicMaterial({ color: '#00e5ff', wireframe: true, transparent: true, opacity: 0.12 });
    const orb = new THREE.Mesh(geom, mat);
    orb.position.y = -10;
    scene.add(orb);

    const origPositions = geom.attributes.position.clone();

    inst.animate = function() {
      if (!inst.running) return;
      requestAnimationFrame(inst.animate);
      const elapsed = clock.getElapsedTime();

      orb.rotation.y = elapsed * 0.05;
      
      const posAttr = orb.geometry.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const ox = origPositions.getX(i);
        const oy = origPositions.getY(i);
        const oz = origPositions.getZ(i);
        const displacement = Math.sin(elapsed * 2.2 + ox * 0.2) * 1.2;
        posAttr.setXYZ(i, ox + displacement, oy + displacement, oz + displacement);
      }
      posAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };
    inst.animate();
  }

  /* ══════════════════════════════════════
     16. HERO TEXT REVEALS (Split-word masks)
  ══════════════════════════════════════ */
  function initHeroAnimation() {
    const tl = gsap.timeline({ defaults: { ease: 'easeOut' } });

    document.querySelectorAll('.title-line').forEach(line => {
      const inner = document.createElement('span');
      inner.className = 'title-line-inner';
      inner.innerHTML = line.innerHTML;
      line.innerHTML = '';
      line.appendChild(inner);
    });

    tl
      .to('.hero-eyebrow',       { opacity: 1, y: 0, duration: .9 })
      .to('.title-line-inner',   { y: '0%', stagger: .14, duration: 1.2, ease: 'power4.out' }, '-=.4')
      .to('.hero-sub',           { opacity: 1, y: 0, duration: .8 }, '-=.6')
      .to('.hero-cta-row',       { opacity: 1, y: 0, duration: .8 }, '-=.5')
      .to('.hero-trust-bar',     { opacity: 1, duration: .7 }, '-=.4')
      .to('.hero-stats',         { opacity: 1, duration: .8 }, '-=.4')
      .to('.hero-scroll-hint',   { opacity: .5, duration: .6 }, '-=.3');

    gsap.to('.hero-content', {
      y: -120,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 2
      }
    });
  }

  /* ══════════════════════════════════════
     17. SCROLL REVEALS & TITLES MASK
  ══════════════════════════════════════ */
  function initScrollReveal() {
    gsap.utils.toArray('.section-label').forEach(el => {
      gsap.to(el, { opacity: 1, y: 0, duration: .7, ease: 'easeOut',
        scrollTrigger: { trigger: el, start: 'top 86%' }
      });
    });

    gsap.utils.toArray('.section-title').forEach(title => {
      const text = title.textContent.trim();
      const words = text.split(/\s+/);
      title.innerHTML = '';
      
      words.forEach(w => {
        const wrapper = document.createElement('span');
        wrapper.className = 'title-mask-wrap';
        wrapper.style.cssText = 'display: inline-block; overflow: hidden; vertical-align: top; margin-right: 0.25em;';
        
        const inner = document.createElement('span');
        inner.className = 'title-mask-inner';
        inner.style.cssText = 'display: inline-block; transform: translateY(115%); transition: transform 0.85s var(--ease-out);';
        inner.textContent = w;
        
        wrapper.appendChild(inner);
        title.appendChild(wrapper);

        ScrollTrigger.create({
          trigger: title,
          start: 'top 88%',
          onEnter() {
            inner.style.transform = 'translateY(0%)';
          }
        });
      });
      title.style.opacity = 1;
      title.style.transform = 'none';
    });

    gsap.utils.toArray('.problem-card').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: .7, delay: i % 3 * .1,
        ease: 'easeOut',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    gsap.utils.toArray('[data-reveal-row]').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, x: 0, duration: .8, delay: i * .08,
        ease: 'easeOut',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });

    gsap.utils.toArray('.stack-node').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, scale: 1, y: 0, duration: .6, delay: i * .03,
        ease: 'back.out(1.4)',
        scrollTrigger: { trigger: '.stack-grid', start: 'top 80%' }
      });
    });

    gsap.utils.toArray('.portfolio-card').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: .85, delay: i % 2 * .14,
        ease: 'easeOut',
        scrollTrigger: { trigger: el, start: 'top 86%' }
      });
    });

    gsap.utils.toArray('.about-card').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, x: 0, duration: .7, delay: i * .1,
        ease: 'easeOut',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      });
    });

    gsap.utils.toArray('[data-reveal]').forEach(el => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: .7,
        ease: 'easeOut',
        scrollTrigger: { trigger: el, start: 'top 86%' }
      });
    });

    gsap.to('.why-big-card', {
      opacity: 1, x: 0, duration: 0.9, ease: 'easeOut',
      scrollTrigger: { trigger: '.why-big-card', start: 'top 82%' }
    });

    gsap.utils.toArray('.ai-cap-card').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, x: 0, duration: .65, delay: i * .08,
        ease: 'easeOut',
        scrollTrigger: { trigger: el, start: 'top 86%' }
      });
    });

    gsap.utils.toArray('.tcard').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: .7, delay: i * .09,
        ease: 'easeOut',
        scrollTrigger: { trigger: el, start: 'top 86%' }
      });
    });

    gsap.utils.toArray('.faq-item').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: .6, delay: i * .07,
        ease: 'easeOut',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    gsap.utils.toArray('.ind-card').forEach((el, i) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: .6, delay: i % 4 * .08,
        ease: 'easeOut',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });
  }

  /* ══════════════════════════════════════
     12. WORKFLOW STEP REVEAL
  ══════════════════════════════════════ */
  function initWorkflow() {
    gsap.utils.toArray('.wf-step').forEach(step => {
      const content = step.querySelector('.wf-content');
      ScrollTrigger.create({
        trigger: step,
        start: 'top 72%',
        onEnter() {
          step.classList.add('revealed');
          gsap.to(content, { opacity: 1, x: 0, duration: .7, ease: 'easeOut' });
        }
      });
    });
  }

  /* ══════════════════════════════════════
     13. SERVICES ACCORDION & GRAPHIC INTERACTION
  ══════════════════════════════════════ */
  function initServicesAccordion() {
    document.querySelectorAll('.service-item').forEach(item => {
      const toggle = item.querySelector('.service-toggle');
      const body   = item.querySelector('.service-body');

      toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';

        /* Close all others */
        document.querySelectorAll('.service-toggle').forEach(t => {
          t.setAttribute('aria-expanded', 'false');
          t.closest('.service-item').querySelector('.service-body').classList.remove('open');
        });

        if (!isOpen) {
          toggle.setAttribute('aria-expanded', 'true');
          body.classList.add('open');

          // Trigger Three.js visual state changes
          const id = item.id.replace('svc-', '');
          if (typeof window._setServicesVisualState === 'function') {
            window._setServicesVisualState(id);
          }

          /* Scroll to active element cleanly */
          setTimeout(() => {
            if (window._lenis) {
              window._lenis.scrollTo(item, { offset: -90, duration: 1.2 });
            }
          }, 350);

          /* Animate contents inside accordion */
          gsap.fromTo(body.querySelectorAll('.tech-chips span'),
            { opacity: 0, y: 6 },
            { opacity: 1, y: 0, stagger: .04, duration: .4, ease: 'easeOut', delay: 0.1 }
          );
          gsap.fromTo(body.querySelectorAll('li'),
            { opacity: 0, x: -8 },
            { opacity: 1, x: 0, stagger: .05, duration: .4, ease: 'easeOut', delay: 0.15 }
          );
        }
      });
    });
  }

  /* ══════════════════════════════════════
     14. STACK FILTER
  ══════════════════════════════════════ */
  function initStackFilter() {
    document.querySelectorAll('.scat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.scat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.getAttribute('data-cat');

        document.querySelectorAll('.stack-node').forEach(node => {
          const nc = node.getAttribute('data-cat');
          const show = cat === 'all' || nc === cat;
          if (show) {
            node.classList.remove('hidden-cat');
            gsap.to(node, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' });
          } else {
            gsap.to(node, { opacity: 0, scale: .85, y: 8, duration: 0.3, onComplete() { node.classList.add('hidden-cat'); } });
          }
        });
      });
    });
  }

  /* ══════════════════════════════════════
     15. 3D TILT CARDS
  ══════════════════════════════════════ */
  function initTiltCards() {
    document.querySelectorAll('[data-tilt]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;
        const rx = -(e.clientY - cy) / (rect.height / 2) * 8;
        const ry =  (e.clientX - cx) / (rect.width  / 2) * 8;

        gsap.to(el, {
          rotateX: rx, rotateY: ry,
          transformPerspective: 1000,
          duration: .4, ease: 'power2.out'
        });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { rotateX: 0, rotateY: 0, duration: .6, ease: 'elastic.out(1,.5)' });
      });
    });
  }

  /* ══════════════════════════════════════
     16. MAGNETIC BUTTONS
  ══════════════════════════════════════ */
  function initMagneticBtns() {
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width  / 2)) * .35;
        const dy = (e.clientY - (r.top  + r.height / 2)) * .35;
        gsap.to(el, { x: dx, y: dy, duration: .4, ease: 'power2.out' });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.45)' });
      });
    });
  }

  /* ══════════════════════════════════════
     17. SCROLL COUNT ANIMATIONS
  ══════════════════════════════════════ */
  function initCounters() {
    document.querySelectorAll('.stat-num').forEach(el => {
      const target = parseInt(el.getAttribute('data-count'));
      ScrollTrigger.create({
        trigger: el, start: 'top 90%', once: true,
        onEnter() {
          gsap.to({ v: 0 }, {
            v: target, duration: 2.2, ease: 'power2.out',
            onUpdate() { el.textContent = Math.round(this.targets()[0].v); }
          });
        }
      });
    });
  }

  /* ══════════════════════════════════════
     18. AI CHATBOT typing trigger
  ══════════════════════════════════════ */
  function initAIChat() {
    const thinking = document.getElementById('aiThinking');
    const response = document.getElementById('aiResponse');
    if (!thinking || !response) return;

    ScrollTrigger.create({
      trigger: '#ai-showcase', start: 'top 60%', once: true,
      onEnter() {
        if (typeof window._triggerSynapsePulse === 'function') {
          window._triggerSynapsePulse();
          var pulseInterval = setInterval(() => {
            if (thinking.style.display !== 'none') window._triggerSynapsePulse();
            else clearInterval(pulseInterval);
          }, 850);
        }

        setTimeout(() => {
          gsap.to(thinking, { opacity: 0, duration: .3, onComplete() {
            thinking.style.display = 'none';
            response.style.display = 'block';
            response.style.opacity = '0';
            gsap.to(response, { opacity: 1, duration: .6, ease: 'easeOut' });
            if (typeof window._triggerSynapsePulse === 'function') window._triggerSynapsePulse();
          }});
        }, 2600);
      }
    });
  }

  /* ══════════════════════════════════════
     19. FAQ
  ══════════════════════════════════════ */
  function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(item => {
      item.addEventListener('toggle', () => {
        const icon = item.querySelector('.faq-icon');
        if (icon) icon.textContent = item.open ? '−' : '+';
      });
    });
  }

  /* ══════════════════════════════════════
     20. CONTACT FORM
  ══════════════════════════════════════ */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<span>Mission Launched ✓</span>';
      btn.style.background = '#10b981';
      btn.style.pointerEvents = 'none';

      // Animate energy pulses traveling into Zibrin core upon submit
      if (typeof window._triggerSynapsePulse === 'function') {
        window._triggerSynapsePulse();
      }

      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
        btn.style.pointerEvents = '';
        form.reset();
      }, 4000);
    });
  }

  /* ══════════════════════════════════════
     21. INDUSTRIES MARQUEE
  ══════════════════════════════════════ */
  function initIndustriesMarquee() {
    const track = document.querySelector('.industries-track');
    if (!track) return;
    track.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
    track.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
  }

}); /* end load */
