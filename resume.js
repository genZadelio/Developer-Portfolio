document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.remove('no-js');

  document.getElementById('resumePrint')?.addEventListener('click', () => window.print());

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
});
