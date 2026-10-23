(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) return;
  const animations = new Set();
  const cards = [...document.querySelectorAll('[data-reveal]')];
  // AOS's fade-up/translate principle, implemented with native browser APIs.
  // Content stays visible without JavaScript; animations run once on entry.
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting);
    visible.forEach((entry, index) => {
      observer.unobserve(entry.target);
      const animation = entry.target.animate([
        { opacity: 0, transform: 'translateY(24px) scale(.985)' },
        { opacity: 1, transform: 'translateY(0) scale(1)' },
      ], { duration: 660, delay: Math.min(index, 5) * 65, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
      animations.add(animation);
      animation.addEventListener('finish', () => animations.delete(animation), { once: true });
    });
  }, { threshold: .08 });
  cards.forEach(card => observer.observe(card));
  reducedMotion.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    animations.forEach(animation => animation.cancel());
    animations.clear();
  });
})();
