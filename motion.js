(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches) return;

  const targets = document.querySelectorAll(
    '.section-label, .section-title, .zzp-content > h2, .contact-inner h2, .application-media, .photo-media'
  );
  const pending = new Set();
  let frame = 0;

  function reveal(element) {
    element.classList.add('is-revealed');
    pending.delete(element);
  }

  function stop() {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
  }

  function update() {
    frame = 0;
    // Read all positions first, then update classes. This also handles a fast
    // scroll or an anchor jump without relying on an intermediate intersection.
    const trigger = window.innerHeight * .88;
    const ready = Array.from(pending).filter(element => element.getBoundingClientRect().top <= trigger);
    ready.forEach(reveal);
    if (!pending.size) stop();
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  targets.forEach(element => {
    element.classList.add('motion-target');
    pending.add(element);
  });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
  document.documentElement.classList.add('has-reveal-motion');
  preference.addEventListener('change', event => {
    if (!event.matches) return;
    stop();
    pending.forEach(reveal);
    document.documentElement.classList.remove('has-reveal-motion');
  });
})();
