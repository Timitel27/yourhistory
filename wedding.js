/* ============================================================
   СКРИПТ СТРАНИЦЫ-ИСТОРИИ «СВАДЬБА»
   Здесь: цвет неба по главам, лепестки, появление блоков,
   параллакс фото, имена по буквам, живой счётчик «мы вместе»,
   росчерк-подпись. Файл автономный: main.js не нужен.
   ============================================================ */

'use strict';

/* Флаг «JS работает» — CSS прячет [data-reveal] только при нём */
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- НЕБО: СМЕНА ЦВЕТА ПО ГЛАВАМ ---------- */
  /* IntersectionObserver смотрит, какая глава сейчас в кадре,
     и перекрашивает фиксированный слой .sky в её небо */
  const sky = document.getElementById('sky');
  const chapters = document.querySelectorAll('.chapter[data-sky]');

  if (sky && chapters.length) {
    const skyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Берем небо главы, которая сейчас видна
          sky.dataset.phase = entry.target.dataset.sky;
        }
      });
    }, { threshold: 0.5 }); // глава считается «в кадре» на 50%
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
  /* Прорисовываем путь, когда финал вошёл в кадр */
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

  /* ---------- ЛЕПЕСТКИ ---------- */
  /* На десктопе — 18 лепестков, на мобильных — 8: экономим батарею */
  const petalsBox = document.getElementById('petals');
  const isMobile = window.matchMedia('(max-width: 720px)').matches;
  const petalCount = isMobile ? 8 : 18;

  if (petalsBox) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < petalCount; i++) {
      const petal = document.createElement('span');
      petal.className = 'petal';
      petal.style.left = Math.random() * 100 + '%';
      // Размер и скорость случайные — падение живое, не механическое
      const size = 8 + Math.random() * 10;
      petal.style.width = size + 'px';
      petal.style.height = size + 'px';
      petal.style.animationDuration = (9 + Math.random() * 10) + 's';
      petal.style.animationDelay = (Math.random() * 10) + 's';
      fragment.appendChild(petal);
    }
    petalsBox.appendChild(fragment);
  }

  /* ---------- ПАРАЛЛАКС ФОТО ---------- */
  /* Фото чуть сдвигается при скролле — глубина «альбома».
     Работает через rAF, чтобы не грузить браузер */
  const parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length) {
    let ticking = false;

    function updateParallax() {
      const vh = window.innerHeight;
      parallaxEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        // Смещение от -20 до 20px в зависимости от позиции в экране
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

  /* ---------- ИМЕНА ПО БУКВАМ ---------- */
  /* Буквы имени появляются по очереди, как будто их выводят пером */
    const namesEl = document.getElementById('names');
  if (namesEl) {
    const text = namesEl.textContent.trim();
    namesEl.textContent = '';
    namesEl.setAttribute('aria-hidden', 'false');

    [...text].forEach((ch, i) => {
      /* Маркер | превращаем в настоящий перенос строки.
         Задержку не увеличиваем — перенос появляется вместе
         с соседней буквой, без паузы */
      if (ch === '|') {
        namesEl.appendChild(document.createElement('br'));
        return;
      }

      const span = document.createElement('span');
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.style.opacity = '0';
      span.style.display = 'inline-block';
      span.style.transition = `opacity .6s ease ${i * 0.09}s, transform .6s ease ${i * 0.09}s`;
      span.style.transform = 'translateY(14px)';
      namesEl.appendChild(span);
      requestAnimationFrame(() => {
        span.style.opacity = '1';
        span.style.transform = 'none';
      });
    });
  }


  /* ---------- СЧЁТЧИК «МЫ ВМЕСТЕ УЖЕ…» ---------- */
  const counter = document.getElementById('togetherCounter');
  if (counter) {
    const startDate = new Date(counter.dataset.date);
    const daysEl    = document.getElementById('tDays');
    const hoursEl   = document.getElementById('tHours');
    const minutesEl = document.getElementById('tMinutes');
    const secondsEl = document.getElementById('tSeconds');

    // Функция возвращает «главное» число с ведущим нулём (07, не 7)
    const pad = (num) => String(num).padStart(2, '0');

    function tick() {
      const diff = Date.now() - startDate; // миллисекунды с момента свадьбы

      if (diff < 0) {
        /* Дата ещё в будущем (демо): показываем «до свадьбы осталось».
           Меняем подпись счётчика на обратную */
        const eyebrow = document.querySelector('.together__eyebrow');
        if (eyebrow) eyebrow.textContent = 'До нашей свадьбы осталось';

        const until = -diff;
        const d = Math.floor(until / 86400000);
        const h = Math.floor(until / 3600000) % 24;
        const m = Math.floor(until / 60000) % 60;
        const s = Math.floor(until / 1000) % 60;

        daysEl.textContent    = d;
        hoursEl.textContent   = pad(h);
        minutesEl.textContent = pad(m);
        secondsEl.textContent = pad(s);
        return;
      }

      /* Дата прошла: считаем «вместе уже» */
      const d = Math.floor(diff / 86400000);
      const h = Math.floor(diff / 3600000) % 24;
      const m = Math.floor(diff / 60000) % 60;
      const s = Math.floor(diff / 1000) % 60;

      daysEl.textContent    = d;
      hoursEl.textContent   = pad(h);
      minutesEl.textContent = pad(m);
      secondsEl.textContent = pad(s);
    }

    tick();
    setInterval(tick, 1000);
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

