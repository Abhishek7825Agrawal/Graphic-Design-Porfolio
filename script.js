(() => {
  const body = document.body;
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.scroll-progress');
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const stage = document.querySelector('.break-stage');
  const hero = document.querySelector('.hero');
  const portrait = document.querySelector('.hero-portrait');
  const shardLayer = document.querySelector('.hero-shards');
  const crackMap = document.querySelector('.crack-map');
  let framePending = false;
  const random = (min, max) => min + Math.random() * (max - min);

  const closeMenu = () => {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    nav.classList.remove('open');
    body.classList.remove('menu-open');
  };

  toggle?.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav?.classList.toggle('open', open);
    body.classList.toggle('menu-open', open);
  });
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

  const updateScroll = () => {
    const maxScroll = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = `${maxScroll > 0 ? scrollY / maxScroll * 100 : 0}%`;
    header?.classList.toggle('scrolled', scrollY > 24);
    framePending = false;
  };
  addEventListener('scroll', () => {
    if (!framePending) { requestAnimationFrame(updateScroll); framePending = true; }
  }, { passive: true });
  updateScroll();

  const makeFragments = (columns, rows) => {
    if (!portrait?.naturalWidth || !shardLayer || !crackMap) return [];
    const nodes = Array.from({ length: rows + 1 }, (_, row) => Array.from({ length: columns + 1 }, (_, col) => ({
      x: col === 0 ? 0 : col === columns ? 100 : col * 100 / columns + random(-8, 8),
      y: row === 0 ? 0 : row === rows ? 100 : row * 100 / rows + random(-7, 7)
    })));
    const triangles = [];
    const edges = new Map();
    const edgeKey = (a, b) => [a.x, a.y, b.x, b.y].join(',') < [b.x, b.y, a.x, a.y].join(',')
      ? [a.x, a.y, b.x, b.y].join(',') : [b.x, b.y, a.x, a.y].join(',');
    const rememberEdge = (a, b) => edges.set(edgeKey(a, b), [a, b]);
    for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
      const a = nodes[row][col], b = nodes[row][col + 1], c = nodes[row + 1][col + 1], d = nodes[row + 1][col];
      const split = Math.random() > .5 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
      triangles.push(...split);
      split.forEach((triangle) => { rememberEdge(triangle[0], triangle[1]); rememberEdge(triangle[1], triangle[2]); rememberEdge(triangle[2], triangle[0]); });
    }

    crackMap.replaceChildren();
    edges.forEach(([a, b]) => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', `M${a.x.toFixed(2)} ${a.y.toFixed(2)} L${b.x.toFixed(2)} ${b.y.toFixed(2)}`);
      const approximateLength = Math.hypot((b.x - a.x) * stage.clientWidth / 100, (b.y - a.y) * stage.clientHeight / 100);
      path.style.strokeDasharray = `${approximateLength} ${approximateLength}`;
      path.style.strokeDashoffset = String(approximateLength);
      crackMap.append(path);
    });

    shardLayer.replaceChildren();
    shardLayer.style.setProperty('--portrait', `url("${portrait.currentSrc || portrait.src}")`);
    const points = (triangle) => triangle.map((point) => `${point.x.toFixed(2)}% ${point.y.toFixed(2)}%`).join(',');
    return triangles.map((triangle, index) => {
      const shard = document.createElement('i');
      const cx = triangle.reduce((sum, point) => sum + point.x, 0) / 3;
      const cy = triangle.reduce((sum, point) => sum + point.y, 0) / 3;
      shard.className = 'shard';
      shard.style.clipPath = `polygon(${points(triangle)})`;
      shard.dataset.center = `${cx},${cy}`;
      shard.dataset.index = String(index);
      shardLayer.append(shard);
      return shard;
    });
  };

  const initializeReveals = () => {
    document.querySelectorAll('[data-reveal]').forEach((element) => {
      gsap.fromTo(element, { y: 22, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: .7, ease: 'power2.out',
        scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        onComplete: () => element.classList.add('revealed')
      });
    });
  };

  const createScrollStory = (mobile) => {
    body.classList.add('js-motion');
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero-kicker', { y: 14, autoAlpha: 0, duration: .55 })
      .from('.hero h1 span', { yPercent: 110, autoAlpha: 0, duration: .8, stagger: .08 }, '-=.3')
      .from('.hero-identity, .hero-intro', { y: 12, autoAlpha: 0, duration: .5, stagger: .09 }, '-=.38');
    initializeReveals();

    const fragments = makeFragments(mobile ? 3 : 4, mobile ? 2 : 3);
    if (fragments.length) {
      const trajectories = fragments.map((fragment) => {
        const [cx, cy] = fragment.dataset.center.split(',').map(Number);
        const dx = cx - 50, dy = cy - 50;
        const length = Math.hypot(dx, dy) || 1;
        const push = random(mobile ? 90 : 150, mobile ? 240 : 460);
        return {
          x: dx / length * push + random(-36, 36),
          y: dy / length * push + random(-42, 42),
          z: random(-240, 170),
          rotation: random(-78, 78),
          rotationX: random(-30, 30),
          rotationY: random(-38, 38),
          scale: random(.7, 1.18),
          opacity: random(0, .04)
        };
      });
      const duration = mobile ? 630 : 900;
      const story = gsap.timeline({ scrollTrigger: {
        trigger: '.break-sequence', start: 'top top', end: `+=${duration}`,
        scrub: .65, pin: '.break-stage', anticipatePin: 1, invalidateOnRefresh: true
      }});
      story
        .to('.hero-copy', { yPercent: -10, autoAlpha: 0, duration: .22 }, .08)
        .to('.hero-shade', { opacity: .12, duration: .3 }, .12)
        .fromTo('.world-design', { xPercent: mobile ? 0 : -100, yPercent: mobile ? -100 : 0 }, { xPercent: 0, yPercent: 0, duration: .55, ease: 'power2.out' }, .06)
        .fromTo('.world-develop', { xPercent: mobile ? 0 : 100, yPercent: mobile ? 100 : 0 }, { xPercent: 0, yPercent: 0, duration: .55, ease: 'power2.out' }, .06)
        .to('.world-half', { autoAlpha: 1, duration: .3 }, .06)
        .fromTo('.energy-seam', { scaleY: .08, autoAlpha: .2 }, { scaleY: 1, autoAlpha: 1, duration: .55, ease: 'power2.out' }, .12)
        .fromTo('.intersection', { autoAlpha: 0, scale: .94 }, { autoAlpha: 1, scale: 1, duration: .45, ease: 'power2.out' }, .48)
        .to(crackMap.querySelectorAll('path'), { opacity: 1, strokeDashoffset: 0, duration: .28, stagger: { each: .003, from: 'random' }, ease: 'none' }, .04)
        .to(fragments, {
          x: (index) => trajectories[index].x,
          y: (index) => trajectories[index].y,
          z: (index) => trajectories[index].z,
          rotation: (index) => trajectories[index].rotation,
          rotationX: (index) => trajectories[index].rotationX,
          rotationY: (index) => trajectories[index].rotationY,
          scale: (index) => trajectories[index].scale,
          opacity: (index) => trajectories[index].opacity,
          stagger: { each: mobile ? .018 : .012, from: 'random' }, duration: .8, ease: 'power2.in'
        }, .19)
        .to('.hero-portrait', { scale: 1.04, opacity: 0, duration: .7, ease: 'power1.in' }, .2)
        .to('.crack-map', { autoAlpha: 0, duration: .3 }, .7);
    } else {
      // A coherent static fallback when the personal photo is not available.
      gsap.set('.break-world', { autoAlpha: 1 });
    }

    gsap.utils.toArray('.project-art-title').forEach((title) => gsap.fromTo(title, { x: mobile ? -13 : -26 }, {
      x: mobile ? 12 : 25, ease: 'none', scrollTrigger: { trigger: title, start: 'top bottom', end: 'bottom top', scrub: true }
    }));
    return () => {
      body.classList.remove('js-motion');
      shardLayer?.replaceChildren();
      crackMap?.replaceChildren();
    };
  };

  const begin = () => {
    body.classList.add('is-ready');
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const match = gsap.matchMedia();
    match.add('(prefers-reduced-motion: no-preference) and (max-width: 700px)', () => createScrollStory(true));
    match.add('(prefers-reduced-motion: no-preference) and (min-width: 701px)', () => createScrollStory(false));
  };

  const loadPortrait = async () => {
    if (!portrait || !hero) { begin(); return; }
    if (portrait.dataset.enabled !== 'true') {
      hero.classList.add('portrait-unavailable');
      begin();
      return;
    }
    portrait.addEventListener('load', () => { hero.classList.add('has-portrait'); begin(); }, { once: true });
    portrait.addEventListener('error', () => { hero.classList.add('portrait-unavailable'); begin(); }, { once: true });
    try {
      const response = await fetch(portrait.dataset.src, { cache: 'force-cache' });
      if (!response.ok) throw new Error('Portrait file is not available');
      portrait.src = URL.createObjectURL(await response.blob());
    } catch {
      hero.classList.add('portrait-unavailable');
      begin();
    }
  };
  loadPortrait();
})();
