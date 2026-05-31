/* reveal.js — Terra Mia Hugo Theme
   IntersectionObserver-driven scroll reveal per [data-reveal].
   Supporta --reveal-delay CSS variable per stagger.
   Aggiornato 2026-05-15. */

(function () {
  'use strict';
  if (typeof window === 'undefined' || !document) return;

  // Fallback: se IntersectionObserver non supportato, mostra tutto subito
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.classList.add('is-visible');
    });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    io.observe(el);
  });
})();
