/* Layout tetap di index.html; dua halaman tugas dimuat sebagai fragmen melalui fetch/Ajax. */
(() => {
  'use strict';
  const outlet = document.querySelector('#dynamic-content');
  const routes = { eksplorasi: 'pages/eksplorasi.html', registrasi: 'pages/registrasi.html' };
  let sequence = 0;
  let dataPromise;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const motionTargets = '[data-reveal]:not(.benefits), .hero-copy > .eyebrow, .hero-copy > h1, .hero-copy > p, .hero-actions, .hero-preview, .hero-baseline > span, .benefit, .panel-heading, .filters, .results-toolbar, .campus-card, .campus-detail, .registration-panel .field, .academic-progress, .registration-panel #submit-button, .data-disclaimer';
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!motionEnabled) return;
      if (!entry.isIntersecting && entry.target.contains(document.activeElement) &&
          document.activeElement.matches('input,select,textarea,button,a')) return;
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
    });
  }, { threshold: 0.01, rootMargin: '0px 0px -2% 0px' }) : null;
  let motionEnabled = false;
  let floatFrame = 0;

  // Elemen tetap tampak bila JavaScript gagal, IO tidak tersedia, atau gerak dikurangi.
  function reveal(root = document) {
    if (!motionEnabled) return;
    root.querySelectorAll(motionTargets).forEach(element => {
      if (element.classList.contains('motion-reveal')) return;
      element.classList.add('motion-reveal');
      observer.observe(element);
    });
  }
  function forget(root) {
    root.querySelectorAll('.motion-reveal').forEach(element => observer?.unobserve(element));
  }
  function floatCard() {
    floatFrame = 0;
    if (!motionEnabled) return;
    const card = document.querySelector('.hero-preview');
    if (!card) return;
    // Bergerak pelan saat halaman digeser, tanpa mengubah layout atau rotasi kartu.
    card.style.setProperty('--float-offset', `${Math.min(16, Math.max(0, scrollY * 0.035)).toFixed(1)}px`);
  }
  function scheduleFloat() {
    if (motionEnabled && !floatFrame) floatFrame = requestAnimationFrame(floatCard);
  }
  function syncMotion() {
    // Tab di latar tidak boleh tampak kosong selagi callback animasi ditunda browser.
    motionEnabled = Boolean(observer) && !motionPreference.matches && !document.hidden;
    document.documentElement.classList.toggle('motion-enabled', motionEnabled);
    if (motionEnabled) {
      document.querySelectorAll('.motion-reveal').forEach(element => observer.observe(element));
      reveal();
      scheduleFloat();
    } else {
      observer?.disconnect();
      if (floatFrame) cancelAnimationFrame(floatFrame);
      floatFrame = 0;
      document.querySelectorAll('.motion-reveal').forEach(element => element.classList.add('is-visible'));
      document.querySelector('.hero-preview')?.style.removeProperty('--float-offset');
    }
  }

  window.SmartFinder = {
    async data() {
      if (!dataPromise) {
        dataPromise = fetch('data/universitas.json', { cache: 'no-store' }).then(response => {
          if (!response.ok) throw new Error(`Data tidak tersedia (${response.status}).`);
          return response.json();
        }).catch(error => { dataPromise = null; throw error; });
      }
      return dataPromise;
    },
    reveal,
    forget
  };

  function currentView() {
    const view = location.hash.slice(1);
    return Object.hasOwn(routes, view) ? view : 'beranda';
  }
  function scrollToRegistration() {
    const heading = outlet.querySelector('#kenalan-title');
    if (!heading) return;
    heading.scrollIntoView({ behavior: 'instant', block: 'start' });
    heading.focus({ preventScroll: true });
  }
  async function render() {
    const view = currentView();
    const request = ++sequence;
    document.querySelectorAll('[data-view]').forEach(link => {
      if (link.dataset.view === view) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    if (view === 'beranda') {
      forget(outlet);
      outlet.replaceChildren();
      outlet.setAttribute('aria-busy', 'false');
      return;
    }
    outlet.setAttribute('aria-busy', 'true');
    forget(outlet);
    outlet.innerHTML = '<div class="loading" role="status">Memuat halaman…</div>';
    try {
      const response = await fetch(routes[view]);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const html = await response.text();
      if (request !== sequence) return;
      // Fragmen milik proyek ini sendiri; jangan mengisi area ini dari sumber tak tepercaya.
      outlet.innerHTML = html;
      if (view === 'eksplorasi') await window.initEksplorasi(outlet);
      else await window.initRegistrasi(outlet);
      if (request !== sequence) return;
      reveal(outlet);
      outlet.setAttribute('aria-busy', 'false');
      if (view === 'registrasi') scrollToRegistration();
      else outlet.scrollIntoView({ behavior: motionPreference.matches ? 'instant' : 'smooth', block: 'start' });
    } catch (error) {
      if (request !== sequence) return;
      outlet.setAttribute('aria-busy', 'false');
      outlet.replaceChildren();
      const notice = document.createElement('div');
      notice.className = 'panel empty-state';
      notice.textContent = `Halaman gagal dimuat: ${error.message}. Jalankan melalui server HTTP lokal, lalu coba lagi. `;
      const retry = document.createElement('button');
      retry.className = 'button button-primary';
      retry.type = 'button';
      retry.textContent = 'Coba lagi';
      retry.addEventListener('click', render);
      notice.append(retry);
      outlet.append(notice);
    }
  }
  // Fokus papan ketik langsung membuka elemen, bahkan sebelum observer terpanggil.
  document.addEventListener('focusin', event => {
    const target = event.target.closest('.motion-reveal');
    if (target) target.classList.add('is-visible');
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-view="registrasi"]');
    if (!link || currentView() !== 'registrasi' || !outlet.querySelector('#kenalan-title')) return;
    event.preventDefault();
    scrollToRegistration();
  });
  addEventListener('scroll', scheduleFloat, { passive: true });
  addEventListener('resize', scheduleFloat);
  motionPreference.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
  syncMotion();
  window.addEventListener('hashchange', render);
  render();
})();
