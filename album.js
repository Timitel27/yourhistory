
/* ============================================================
   СКРИПТ СТРАНИЦЫ «СЕМЕЙНЫЙ АЛЬБОМ»
   Здесь: жемчужины, появление блоков, параллакс карточек,
   модальное окно, валидация формы (телефон или email).
   Файл автономный: main.js не нужен.
   ============================================================ */

'use strict';

/* Флаг «JS работает» — CSS прячет [data-reveal] только при нём */
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- ЖЕМЧУЖИНЫ ---------- */
  const pearlsContainer = document.getElementById('pearls');
  if (pearlsContainer) {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const count = isMobile ? 8 : 14;

    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const pearl = document.createElement('div');
      pearl.className = 'pearl';
      pearl.style.left = (Math.random() * 100) + '%';
      pearl.style.animationDuration = (8 + Math.random() * 8) + 's';
      pearl.style.animationDelay = (Math.random() * 8) + 's';
      pearl.style.opacity = (Math.random() * 0.4 + 0.3).toFixed(2);
      const size = 10 + Math.random() * 10;
      pearl.style.width = size + 'px';
      pearl.style.height = size + 'px';
      fragment.appendChild(pearl);
    }
    pearlsContainer.appendChild(fragment);
  }

  /* ---------- ПОЯВЛЕНИЕ БЛОКОВ ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  /* ---------- ПАРАЛЛАКС КАРТОЧЕК ПО МЫШИ ---------- */
  /* Работает только на десктопе; обработчик — через rAF,
     чтобы не пересчитывать позиции чаще раза за кадр */
  const parallaxCards = document.querySelectorAll('[data-parallax]');
  const canHover = window.matchMedia('(hover: hover)').matches;

  if (canHover && parallaxCards.length) {
    let ticking = false;

    window.addEventListener('mousemove', (e) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;

        parallaxCards.forEach(card => {
          const photo = card.querySelector('.card__photo');
          if (photo) {
            photo.style.transform =
              `translate(${(50 - x) * 0.1}%, ${(50 - y) * 0.1}%) scale(1.08)`;
          }
        });
        ticking = false;
      });
    });
  }

  /* ---------- МОДАЛЬНОЕ ОКНО ---------- */
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose   = document.getElementById('modalClose');
  const modalPhoto   = document.getElementById('modalPhoto');
  const modalTitle   = document.getElementById('modalTitle');
  const modalDesc    = document.getElementById('modalDesc');

  function openModal(card) {
    const photo = card.querySelector('.card__photo');
    const year  = card.querySelector('.card__year').textContent;
    const title = card.querySelector('.card__title').textContent;
    const desc  = card.querySelector('.card__desc').textContent;

    /* Градиент карточки задан классом в CSS, а не инлайн-стилем,
       поэтому берём вычисленный стиль — так фон модалки
       всегда совпадает с карточкой, даже после замены на фото */
    if (photo) {
      modalPhoto.style.backgroundImage =
        getComputedStyle(photo).backgroundImage;
    }
    modalTitle.textContent = year + ' — ' + title;
    modalDesc.textContent = desc;

    modalOverlay.classList.add('is-open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // блокируем скролл под окном
  }

  function closeModal() {
    modalOverlay.classList.remove('is-open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => openModal(card));
  });

  if (modalOverlay) {
    modalClose.addEventListener('click', closeModal);

    // Клик по тёмной подложке (не по самой карточке) закрывает окно
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });

    // Esc — тоже закрывает
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('is-open')) {
        closeModal();
      }
    });
  }

  /* ---------- ВАЛИДАЦИЯ ФОРМЫ ---------- */
  const form = document.getElementById('albumForm');
  const formError = document.getElementById('formError');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      formError.textContent = '';

      let valid = true;
      form.querySelectorAll('.form__input').forEach(input => {
        const val = input.value.trim();
        const empty = val === '';

        /* Контактное поле: принимаем телефон ИЛИ email */
        if (input.name === 'contact') {
          const isEmail = /^\S+@\S+\.\S+$/.test(val);

          // Телефон: убираем всё, кроме цифр, и смотрим на их количество
          const digits = val.replace(/\D/g, '');
          const isPhone = digits.length === 10 ||
            (digits.length === 11 && (digits[0] === '7' || digits[0] === '8'));

          const ok = isEmail || isPhone;
          input.classList.toggle('is-error', !ok);
          if (!ok) valid = false;
          return;
        }

        /* Остальные поля: просто не пустые */
        input.classList.toggle('is-error', empty);
        if (empty) valid = false;
      });

      if (valid) {
        /* Когда выберете способ отправки (Formspree / Telegram / PHP),
           вставьте здесь fetch — как на главной */
        formError.textContent = 'Спасибо! Ваша история принята. Мы свяжемся с вами.';
        formError.style.color = '#b8e6c9';
        form.reset();
      } else {
        formError.textContent = 'Пожалуйста, заполните все поля корректно.';
        formError.style.color = '#ffaaaa';
      }
    });

    /* Ошибка гаснет, как только пользователь начинает исправлять */
    form.querySelectorAll('.form__input').forEach(input => {
      input.addEventListener('input', () => input.classList.remove('is-error'));
    });
  }

  /* ============================================================
     НАВИГАЦИЯ ПО РАЗДЕЛАМ: scroll-spy, бургер, плотность панели
     ============================================================ */

  const sectionNav = document.getElementById('sectionNav');
  const navBurger  = document.getElementById('navBurger');
  const navMenu    = document.getElementById('navMenu');
  const navLinks   = document.querySelectorAll('.section-nav__link');

  /* --- Scroll-spy: IntersectionObserver, threshold 0.5 --- */
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('is-active', link.dataset.section === entry.target.id);
        });
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.chapter').forEach(chapter => {
    spyObserver.observe(chapter);
  });

  /* --- Плотность панели: наверху чуть прозрачнее --- */
  const onScroll = () => {
    if (window.scrollY > 80) {
      sectionNav.classList.add('is-scrolled');
    } else {
      sectionNav.classList.remove('is-scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // инициализация

  /* --- Бургер-меню (мобильные) --- */
  function toggleMenu(force) {
    const isOpen = force !== undefined ? force : !navMenu.classList.contains('is-open');

    navMenu.classList.toggle('is-open', isOpen);
    navBurger.classList.toggle('is-open', isOpen);
    navBurger.setAttribute('aria-expanded', String(isOpen));
    navBurger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  }

  navBurger.addEventListener('click', () => toggleMenu());

  /* Закрытие меню при клике на пункт навигации */
  navLinks.forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  /* Закрытие меню по Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      toggleMenu(false);
    }
  });

});