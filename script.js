const year = document.querySelector('[data-year]');
const download = document.querySelector('[data-download]');
const toast = document.querySelector('[data-toast]');

if (year) year.textContent = new Date().getFullYear();

download?.addEventListener('click', () => {
  toast?.classList.add('is-visible');
  window.setTimeout(() => toast?.classList.remove('is-visible'), 1800);
});
