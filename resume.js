document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.remove('no-js');

  document.getElementById('resumePrint')?.addEventListener('click', () => window.print());
});
