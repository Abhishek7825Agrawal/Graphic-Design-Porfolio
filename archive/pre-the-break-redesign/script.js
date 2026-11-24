(() => {
  const body = document.body;
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.site-nav');
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.scroll-progress');
  const hero = document.querySelector('.hero');
  const portrait = document.querySelector('.hero-portrait');
  const shardLayer = document.querySelector('.hero-shards');
  let scrollPending = false;
  let motionInitialized = false;
  const randomBetween = (min, max) => min + Math.random() * (max - min);

  const closeMenu = () => {
    if (!toggle || !nav) return;
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation');
    body.classList.remove('menu-open');
  };
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      nav.classList.toggle('open', open);
      body.classList.toggle('menu-open', open);
    });
    nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 620) closeMenu(); });
  }

  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    if (header) header.classList.toggle('scrolled', window.scrollY > 25);
    scrollPending = false;
  };
  window.addEventListener('scroll', () => {
    if (!scrollPending) { requestAnimationFrame(updateScroll); scrollPending = true; }
  }, { passive: true });

  const makeShards = (columns, rows) => {
    if (!shardLayer || !portrait?.naturalWidth) return [];
    const points = Array.from({ length: rows + 1 }, (_, row) => Array.from({ length: columns + 1 }, (_, col) => ({
      x: col === 0 ? 0 : col === columns ? 100 : col * 100 / columns + randomBetween(-8, 8),
      y: row === 0 ? 0 : row === rows ? 100 : row * 100 / rows + randomBetween(-8, 8)
    })));
    const triangles = [];
    const pointText = (point) => `${point.x.toFixed(2)}% ${point.y.toFixed(2)}%`;
    for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
      const a = points[row][col], b = points[row][col + 1];
      const c = points[row + 1][col + 1], d = points[row + 1][col];
      if (Math.random() > .5) triangles.push([a,b,c],[a,c,d]);
      else triangles.push([a,b,d],[b,c,d]);
    }
    shardLayer.replaceChildren();
    shardLayer.style.setProperty('--portrait', `url("${portrait.currentSrc || portrait.src}")`);
    return triangles.map((triangle, index) => {
      const shard = document.createElement('i');
      shard.className = 'shard';
      shard.style.clipPath = `polygon(${triangle.map(pointText).join(',')})`;
      const centerX = triangle.reduce((sum, point) => sum + point.x, 0) / 3;
      const centerY = triangle.reduce((sum, point) => sum + point.y, 0) / 3;
      shard.dataset.center = `${centerX},${centerY}`;
      shard.dataset.shard = String(index);
      shardLayer.append(shard);
      return shard;
    });
  };

  const setupMotion = (mobile) => {
    body.classList.add('js-motion');
    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('.hero-eyebrow', { y: 14, autoAlpha: 0, duration: .55 })
      .from('.hero h1', { y: 24, autoAlpha: 0, duration: .7 }, '-=.32')
      .from('.hero-intro, .hero-actions', { y: 16, autoAlpha: 0, duration: .55, stagger: .1 }, '-=.34');

    gsap.utils.toArray('[data-reveal]').forEach((element) => {
      gsap.fromTo(element, { y: 18, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: .65, ease: 'power2.out',
        scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        onComplete: () => element.classList.add('revealed')
      });
    });

    const pieces = makeShards(mobile ? 3 : 4, mobile ? 2 : 3);
    if (pieces.length && hero) {
      const travel = mobile ? 205 : 390;
      const destinations = pieces.map((piece) => {
        const [centerX, centerY] = piece.dataset.center.split(',').map(Number);
        const vx = centerX - 50, vy = centerY - 50;
        const length = Math.hypot(vx, vy) || 1;
        const distance = randomBetween(mobile ? 75 : 130, mobile ? 185 : 360);
        return {
          x: vx / length * distance + randomBetween(-travel * .15, travel * .15),
          y: vy / length * distance + randomBetween(-travel * .15, travel * .15),
          rotation: randomBetween(-58, 58), scale: randomBetween(.72, 1.14), opacity: randomBetween(0, .08)
        };
      });
      gsap.timeline({ scrollTrigger: {
        trigger: '.hero-stage', start: 'top top', end: `+=${mobile ? 510 : 780}`,
        scrub: .55, pin: true, anticipatePin: 1, invalidateOnRefresh: true
      }})
        .to('.hero-copy', { yPercent: -17, autoAlpha: 0, duration: .28, ease: 'power1.in' }, 0)
        .to('.hero-bottom', { autoAlpha: 0, duration: .16 }, 0)
        .fromTo('.underlay-copy', { y: 24, autoAlpha: .25 }, { y: 0, autoAlpha: 1, duration: .48, ease: 'power2.out' }, .12)
        .to('.hero-shade', { opacity: .04, duration: .4 }, .12)
        .to(pieces, {
          x: (index) => destinations[index].x, y: (index) => destinations[index].y,
          rotation: (index) => destinations[index].rotation, scale: (index) => destinations[index].scale,
          opacity: (index) => destinations[index].opacity,
          stagger: { each: mobile ? .014 : .01, from: 'random' }, duration: .74, ease: 'power2.in'
        }, .22)
        .to('.hero-portrait', { scale: 1.055, opacity: 0, duration: .64 }, .2);
    } else if (hero) {
      gsap.to('.fallback-word', { yPercent: -5, ease: 'none', scrollTrigger: { trigger: '.hero-stage', start: 'top top', end: 'bottom top', scrub: true } });
    }

    gsap.utils.toArray('.project-art-title').forEach((title) => {
      gsap.fromTo(title, { x: mobile ? -16 : -34 }, {
        x: mobile ? 12 : 28, ease: 'none', scrollTrigger: { trigger: title, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
    return () => { body.classList.remove('js-motion'); shardLayer?.replaceChildren(); };
  };

  const initMotion = () => {
    if (motionInitialized) return;
    motionInitialized = true;
    body.classList.add('is-ready');
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference) and (max-width: 620px)', () => setupMotion(true));
    media.add('(prefers-reduced-motion: no-preference) and (min-width: 621px)', () => setupMotion(false));
  };

  const enablePortrait = async () => {
    if (!portrait || !hero) { initMotion(); return; }
    const source = portrait.dataset.src;
    const markReady = () => { hero.classList.add('has-portrait'); initMotion(); };
    const markMissing = () => { hero.classList.add('portrait-unavailable'); initMotion(); };
    if (location.protocol === 'file:') {
      portrait.addEventListener('load', markReady, { once: true });
      portrait.addEventListener('error', markMissing, { once: true });
      portrait.src = source;
      return;
    }
    try {
      const response = await fetch(source, { cache: 'force-cache' });
      if (!response.ok) throw new Error('Portrait asset unavailable');
      const imageBlob = await response.blob();
      portrait.addEventListener('load', markReady, { once: true });
      portrait.addEventListener('error', markMissing, { once: true });
      portrait.src = URL.createObjectURL(imageBlob);
    } catch { markMissing(); }
  };

  enablePortrait();
  updateScroll();
})();

