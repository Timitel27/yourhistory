/* ============================================================
   ОСНОВНОЙ СКРИПТ ГЛАВНОЙ СТРАНИЦЫ
   Здесь: прелоадер, бургер-меню, печатная машинка, сердечки,
   tilt-эффект карточек, параллакс-демо, карусель-перетаскивание,
   автослайдер отзывов, валидация формы.
   ============================================================ */

'use strict';

/* ---------- ПРЕЛОАДЕР ---------- */
/* Когда страница полностью загрузилась — прячем прелоадер */
window.addEventListener('load', () => {
  document.getElementById('preloader').classList.add('is-hidden');
});

/* ---------- ШАПКА: сжатие при скролле ---------- */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  // После 60px прокрутки добавляем класс — CSS уменьшит отступы
  header.classList.toggle('is-scrolled', window.scrollY > 60);
});

/* ---------- БУРГЕР-МЕНЮ ---------- */
const burger = document.getElementById('burger');
const mobileNav = document.getElementById('mobileNav');

burger.addEventListener('click', () => {
  burger.classList.toggle('is-open');
  mobileNav.classList.toggle('is-open');
});

/* Закрываем меню после клика по любой ссылке */
mobileNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('is-open');
    mobileNav.classList.remove('is-open');
  });
});

/* ---------- ПЛАВНЫЙ СКРОЛЛ ПО ЯКОРЯМ ---------- */
document.querySelectorAll('[data-scroll]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ---------- ПЕЧАТНАЯ МАШИНКА В HERO ---------- */
/* Пишем фразу посимвольно, затем стераем и пишем следующую — цикл */
const phrases = [
  'Каждая история достойна страницы',
  'Сохраните ваши моменты навсегда',
  'Ваша любовь — в живой форме'
];
const typingEl = document.getElementById('typing');
let phraseIdx = 0, charIdx = 0, deleting = false;

function typeLoop() {
  const phrase = phrases[phraseIdx];

  if (!deleting) {
    // Печатаем до конца фразы
    charIdx++;
    typingEl.textContent = phrase.slice(0, charIdx);
    if (charIdx === phrase.length) {
      deleting = true;
      return setTimeout(typeLoop, 2200); // пауза с полной фразой
    }
    return setTimeout(typeLoop, 55);     // скорость печати
  }

  // Стираем
  charIdx--;
  typingEl.textContent = phrase.slice(0, charIdx);
  if (charIdx === 0) {
    deleting = false;
    phraseIdx = (phraseIdx + 1) % phrases.length; // следующая фраза
    return setTimeout(typeLoop, 500);
  }
  return setTimeout(typeLoop, 28); // скорость стирания
}
typeLoop();

/* ---------- ПЛАВАЮЩИЕ СЕРДЕЧКИ В HERO ---------- */
/* Генерируем 20 сердечек со случайным размером, позицией и скоростью */
const heartsBox = document.getElementById('heroHearts');
for (let i = 0; i < 20; i++) {
  const heart = document.createElement('span');
  heart.className = 'float-heart';
  heart.textContent = '♥';
  heart.style.left = Math.random() * 100 + '%';
  heart.style.fontSize = (10 + Math.random() * 22) + 'px';
  // Длительность полёта: от 8 до 18 секунд
  heart.style.animationDuration = (8 + Math.random() * 10) + 's';
  heart.style.animationDelay = (Math.random() * 8) + 's';
  heartsBox.appendChild(heart);
}

/* ---------- ПОЯВЛЕНИЕ БЛОКОВ ПРИ СКРОЛЛЕ ---------- */
/* IntersectionObserver следит за элементами [data-reveal]:
   как только блок виден на 15% — добавляем is-visible (CSS проявит его) */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target); // проявляем один раз
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

/* ---------- TILT-ЭФФЕКТ КАРТОЧЕК ---------- */
/* Карточка наклоняется вслед за курсором, как 3D-объект */
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    // Считаем отклонение курсора от центра: от -1 до 1
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    // Наклон максимум 10 градусов
    card.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  });
  // Возвращаем карточку в ровное положение, когда курсор ушёл
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(600px) rotateY(0) rotateX(0)';
  });
});

/* ---------- ДЕМО ПАРАЛЛАКСА ---------- */
/* Картинка внутри рамки двигается навстречу курсору — эффект глубины */
const parallaxBox = document.getElementById('parallaxDemo');
if (parallaxBox) {
  const inner = parallaxBox.querySelector('.demo__parallax-inner');
  parallaxBox.addEventListener('mousemove', (e) => {
    const rect = parallaxBox.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    inner.style.transform = `translate(${x * 25}px, ${y * 25}px)`;
  });
  inner.addEventListener('mouseleave', () => {
    inner.style.transform = 'translate(0, 0)';
  });
}

/* ---------- КАРУСЕЛЬ РАБОТ: ПЕРЕТАСКИВАНИЕ ---------- */
const carousel = document.getElementById('carousel');
let isDown = false, startX = 0, scrollStart = 0;

carousel.addEventListener('mousedown', (e) => {
  isDown = true;
  carousel.classList.add('is-dragging');
  startX = e.pageX;
  scrollStart = carousel.scrollLeft;
});

window.addEventListener('mouseup', () => {
  isDown = false;
  carousel.classList.remove('is-dragging');
});

carousel.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  e.preventDefault();
  // Сдвигаем ленту пропорционально движению мыши
  carousel.scrollLeft = scrollStart - (e.pageX - startX) * 1.4;
});

/* ---------- АВТОСЛАЙДЕР ОТЗЫВОВ ---------- */
const reviews = document.querySelectorAll('#reviewsSlider .review');
const dotsBox = document.getElementById('reviewsDots');
let reviewIdx = 0, autoTimer;

// Создаём точки-переключатели по числу отзывов
reviews.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.setAttribute('aria-label', 'Отзыв ' + (i + 1));
  dot.addEventListener('click', () => {
    showReview(i);
    restartAuto(); // после ручного клика перезапускаем таймер
  });
  dotsBox.appendChild(dot);
});
const dots = dotsBox.querySelectorAll('button');

function showReview(i) {
  reviewIdx = i;
  reviews.forEach((r, k) => r.classList.toggle('is-active', k === i));
  dots.forEach((d, k) => d.classList.toggle('is-active', k === i));
}

function restartAuto() {
  clearInterval(autoTimer);
  // Каждые 5 секунд — следующий отзыв (по кругу)
  autoTimer = setInterval(() => {
    showReview((reviewIdx + 1) % reviews.length);
  }, 5000);
}

showReview(0);
restartAuto();

/* ---------- ВАЛИДАЦИЯ ФОРМЫ ---------- */
const form = document.getElementById('contactForm');
const status = document.getElementById('formStatus');

form.addEventListener('submit', (e) => {
/* ---------- ОТПРАВКА ФОРМЫ НА СЕРВЕР ---------- */
// FormData автоматически собирает все поля формы
const data = new FormData(form);

// Меняем кнопку в состояние «отправляется», чтобы не кликали дважды
form.querySelector('.form__btn').disabled = true;
status.textContent = 'Отправляем…';

// fetch отправляет данные на адрес из атрибута action
fetch(form.action, {
  method: 'POST',
  body: data,
  headers: { 'Accept': 'application/json' }
})
  .then(response => {
    if (response.ok) {
      // Сервер принял заявку
      status.textContent = 'Спасибо! Мы свяжемся с вами совсем скоро ♥';
      status.classList.add('is-ok');
      form.reset();
    } else {
      status.textContent = 'Что-то пошло не так. Напишите нам напрямую.';
    }
  })
  .catch(() => {
    // Проблемы с сетью
    status.textContent = 'Ошибка соединения. Проверьте интернет.';
  })
  .finally(() => {
    form.querySelector('.form__btn').disabled = false;
  });


  let valid = true;

  // Проверяем каждое поле: пустое — подсвечиваем ошибкой
  form.querySelectorAll('.form__input').forEach(input => {
    const empty = input.value.trim() === '';
    // Email проверяем дополнительно по шаблону
    const badEmail = input.type === 'email' &&
      input.value.trim() !== '' &&
      !/^\S+@\S+\.\S+$/.test(input.value.trim());

    input.classList.toggle('is-error', empty || badEmail);
    if (empty || badEmail) valid = false;
  });

  if (!valid) {
    status.textContent = 'Пожалуйста, заполните все поля корректно';
    return;
  }

  /* Здесь, когда будет бэкенд/почтовый сервис, отправляйте данные.
     Пока имитируем успешную отправку */
  status.textContent = 'Спасибо! Мы свяжемся с вами совсем скоро ♥';
  status.classList.add('is-ok');
  form.reset();
});

/* Убираем подсветку ошибки, когда пользователь начинает исправлять поле */
form.querySelectorAll('.form__input').forEach(input => {
  input.addEventListener('input', () => input.classList.remove('is-error'));
});
