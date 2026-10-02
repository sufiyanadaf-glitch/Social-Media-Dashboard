/* Light/dark theme manager.
   Loaded in <head> so the theme is set before the page paints (no flash).
   Choice is remembered in localStorage; first visit follows the OS setting. */
(function () {
  var KEY = 'smd_theme';

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function initial() {
    var s = stored();
    if (s === 'light' || s === 'dark') return s;
    return (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }

  document.documentElement.setAttribute('data-theme', initial());

  window.getTheme = function () { return document.documentElement.getAttribute('data-theme'); };

  function updateButtons() {
    var dark = window.getTheme() === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      b.querySelector('.t-label').textContent = dark ? 'Light' : 'Dark';
      b.querySelector('.t-sun').classList.toggle('hidden', !dark);
      b.querySelector('.t-moon').classList.toggle('hidden', dark);
    });
  }

  window.setTheme = function (t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem(KEY, t); } catch (e) {}
    updateButtons();
    document.dispatchEvent(new CustomEvent('themechange', { detail: t }));
  };

  window.toggleTheme = function () {
    window.setTheme(window.getTheme() === 'dark' ? 'light' : 'dark');
  };

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
      b.addEventListener('click', window.toggleTheme);
    });
    updateButtons();
  });
})();
