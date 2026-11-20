/* ============================================================
   СКРИПТ СТРАНИЦЫ «ГОДОВЩИНА. ЖЕМЧУЖНАЯ СВАДЬБА»
   Здесь: небо по главам, всплывающие жемчужины, перламутровый
   заголовок, слайд-шоу с точками, лента с перетаскиванием,
   нить жемчуга в финале, параллакс, появление блоков.
   Файл автономный: main.js не нужен.
   ============================================================ */

'use strict';

/* Флаг «JS работает» — CSS прячет [data-reveal] только при нём */
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- НЕБО: СМЕНА ЦВЕТА ПО ГЛАВАМ ---------- */
  const sky = document.getElementById('sky');
  const chapters = document.querySelectorAll('.chapter[data-sky]');

  if (sky && chapters.length) {
    const skyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          sky.dataset.phase = entry.target.dataset.sky;
        }
      });
    }, { threshold: 0.5 });
    chapters.forEach(ch => skyObserver.observe(ch));
  }

  /* ---------- ПОЯВЛЕНИЕ БЛОКОВ ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  /* ---------- РОСЧЕРК-ПОДПИСЬ ---------- */
  const sign = document.getElementById('sign');
  if (sign) {
    const signObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          sign.classList.add('is-drawn');
          signObserver.unobserve(sign);
        }
      });
    }, { threshold: 0.4 });
    signObserver.observe(sign);
  }

  /* ---------- ВСПЛЫВАЮЩИЕ ЖЕМЧУЖИНЫ ---------- */
  const pearlsBox = document.getElementById('pearls');
  const isMobile = window.matchMedia('(max-width: 720px)').matches;
  const pearlCount = isMobile ? 8 : 16;

  if (pearlsBox) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < pearlCount; i++) {
      const pearl = document.createElement('span');
      pearl.className = 'pearl';
      pearl.style.left = Math.random() * 100 + '%';
      const size = 8 + Math.random() * 12;
      pearl.style.width = size + 'px';
      pearl.style.height = size + 'px';
      pearl.style.animationDuration = (14 + Math.random() * 14) + 's';
      pearl.style.animationDelay = (Math.random() * 12) + 's';
      fragment.appendChild(pearl);
    }
    pearlsBox.appendChild(fragment);
  }

  /* ---------- СЛАЙД-ШОУ (универсальная функция) ---------- */
  /* Готовит любое количество слайд-шоу: сам кадр, точки,
     автосмена каждые 4 секунды и пауза вне экрана */
  function initSlideshow(rootId, dotsId) {
    const box = document.getElementById(rootId);
    const dotsBox = document.getElementById(dotsId);
    if (!box || !dotsBox) return;

    const slides = box.querySelectorAll('.slideshow__slide');
    if (!slides.length) return;

    let current = 0;
    let autoTimer = null;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Слайд ' + (i + 1));
      dot.addEventListener('click', () => {
        show(i);
        restartAuto();
      });
      dotsBox.appendChild(dot);
    });
    const dots = dotsBox.querySelectorAll('button');

    function show(i) {
      current = i;
      slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
      dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
    }

    function next() { show((current + 1) % slides.length); }

    function restartAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(next, 4000);
    }

    show(0);
    restartAuto();

    /* Слайд-шоу вне экрана — таймер спит: экономим ресурсы */
    const boxObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !autoTimer) {
          restartAuto();
        } else if (!entry.isIntersecting && autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      });
    }, { threshold: 0.15 });
    boxObserver.observe(box);
  }

  initSlideshow('slideshow', 'slideshowDots');           // ситцевая глава
  initSlideshow('slideshowSilver', 'slideshowSilverDots'); // серебряная глава

  /* ---------- ЛЕНТА НОВОСТЕЙ: ПЕРЕТАСКИВАНИЕ ---------- */
  const feed = document.getElementById('feed');
  if (feed) {
    let isDown = false, startX = 0, scrollStart = 0;
    let ticking = false;

    // Для тач-устройств: начальное касание
    feed.addEventListener('touchstart', (e) => {
      isDown = true;
      startX = e.touches[0].pageX;
      scrollStart = feed.scrollLeft;
    }, { passive: true });

    feed.addEventListener('touchmove', (e) => {
      if (!isDown) return;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          feed.scrollLeft = scrollStart - (e.touches[0].pageX - startX) * 1.4;
          ticking = false;
        });
      }
    }, { passive: true });

    feed.addEventListener('touchend', () => { isDown = false; });

    // Мышь: зажать и тянуть
    feed.addEventListener('mousedown', (e) => {
      isDown = true;
      feed.classList.add('is-dragging');
      startX = e.pageX;
      scrollStart = feed.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      isDown = false;
      feed.classList.remove('is-dragging');
    });

    feed.addEventListener('mousemove', (e) => {
      if (!isDown || ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        feed.scrollLeft = scrollStart - (e.pageX - startX) * 1.4;
        ticking = false;
      });
    });
  }

  /* ---------- НИТЬ ЖЕМЧУГА ---------- */
  /* 30 жемчужин = 30 лет. Создаём, а когда финал входит в кадр —
     загораем их по очереди, жемчужина за жемчужиной */
  const pearlString = document.getElementById('pearlString');
  if (pearlString) {
    const YEARS = 30;
    const beadsFragment = document.createDocumentFragment();
    for (let i = 0; i < YEARS; i++) {
      const bead = document.createElement('span');
      bead.className = 'pearl-string__bead';
      beadsFragment.appendChild(bead);
    }
    pearlString.appendChild(beadsFragment);
    const beads = pearlString.querySelectorAll('.pearl-string__bead');

    const stringObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          beads.forEach((bead, i) => {
            // Каждая жемчужина загорается с шагом 70 мс — «ожерелье»
            // нанизывается у читателя на глазах (~2 секунды на все 30)
            setTimeout(() => bead.classList.add('is-lit'), i * 70);
          });
          stringObserver.unobserve(pearlString);
        }
      });
    }, { threshold: 0.4 });
    stringObserver.observe(pearlString);
  }

  /* ---------- ПАРАЛЛАКС ФОТО ---------- */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length) {
    let ticking = false;

    function updateParallax() {
      const vh = window.innerHeight;
      parallaxEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        el.style.transform = `translateY(${progress * -40}px) scale(1.06)`;
      });
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateParallax);
      }
    }, { passive: true });

    updateParallax();
  }

  /* ---------- ПЛАВНЫЙ ПЕРЕХОД ПО ЯКОРЯМ ---------- */
  document.querySelectorAll('[data-goto]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

});
