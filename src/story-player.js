import { scores } from './story-scores.js';

const film = document.querySelector('[data-film]');
if (film) {
  const duration = 15000;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 640px)');
  const art = film.querySelector('.story-art');
  const frame = () => art.setAttribute('viewBox',mobile.matches ? film.dataset.mobileFrame : '0 0 960 580');
  mobile.addEventListener('change',frame);
  frame();
  const toggle = film.querySelector('[data-story-toggle]');
  const replay = film.querySelector('[data-story-replay]');
  const seek = film.querySelector('[data-story-seek]');
  const time = film.querySelector('[data-story-time]');
  const chapters = [...film.querySelectorAll('[data-story-chapter]')];
  const animations = scores[film.dataset.film].map(([selector, keyframes]) => {
    const animation = film.querySelector(selector).animate(keyframes, {duration, fill:'both'});
    animation.pause();
    return animation;
  });
  const captions = [...film.querySelectorAll('[data-film-caption]')];
  let position = reduced.matches ? duration : 0;
  let last = 0;
  let raf = 0;
  let inView = false;
  let paused = reduced.matches;
  let scrubbing = false;

  function paint() {
    animations.forEach(animation => { animation.currentTime = position; });
    const chapter = Math.min(2, Math.floor(position / 5000));
    captions.forEach((caption,index) => {caption.hidden = index !== chapter;});
    chapters.forEach((button,index) => {button.setAttribute('aria-pressed',String(index === chapter));});
    seek.value = String(position);
    time.textContent = `${String(Math.floor(position / 1000)).padStart(2,'0')} / 15`;
    film.dataset.chapter = String(chapter);
    film.dataset.position = String(Math.round(position));
  }

  function tick(now) {
    if (now - last >= 33) {
      position = Math.min(duration, position + now - last);
      last = now;
      paint();
      if (position === duration) {paused = true;update();return;}
    }
    raf = requestAnimationFrame(tick);
  }

  function update() {
    cancelAnimationFrame(raf);
    const running = !paused && !scrubbing && inView && !document.hidden;
    film.dataset.playing = String(running);
    toggle.textContent = paused ? '播放短片' : '暂停短片';
    toggle.setAttribute('aria-pressed',String(paused));
    if (running) {last = performance.now();raf = requestAnimationFrame(tick);}
  }

  function jump(value) {position = value;paint();last = performance.now();}
  toggle.addEventListener('click',()=>{if(paused && position === duration)jump(0);paused = !paused;update();});
  replay.addEventListener('click',()=>{jump(0);paused = false;update();});
  seek.addEventListener('input',()=>{jump(Number(seek.value));});
  seek.addEventListener('pointerdown',()=>{scrubbing = true;update();});
  addEventListener('pointerup',()=>{if(scrubbing){scrubbing = false;update();}});
  chapters.forEach((button,index)=>button.addEventListener('click',()=>{jump(index * 5000);update();}));
  document.addEventListener('visibilitychange',update);
  reduced.addEventListener('change',()=>{paused = reduced.matches;jump(reduced.matches ? duration : 0);update();});
  addEventListener('pagehide',()=>{inView = false;update();});
  addEventListener('pageshow',()=>{observer.disconnect();observer.observe(film);});
  const observer = new IntersectionObserver(([entry])=>{inView = entry.isIntersecting;update();},{threshold:.12});
  observer.observe(film);
  film.querySelector('[data-story-controls]').hidden = false;
  film.classList.add('is-enhanced');
  paint();
  update();
}
