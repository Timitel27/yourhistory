/* ============================================================
   СКРИПТ СТРАНИЦЫ «КАК ВСЁ НАЧАЛОСЬ»
   Здесь: лепестки, появление блоков, живой счётчик знакомства,
   сцена мессенджера с «печатает…» и перезапуском, проявление
   полароида, росчерк-подпись, плавные переходы по якорям.
   Файл автономный.
   ============================================================ */

'use strict';

/* Флаг «JS работает» — CSS прячет [data-reveal] только при нём */
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- ДАТА ЗНАКОМСТВА (заглушка) ---------- */
  /* 3 октября 2025, 19:20. Меняете на реальную — счётчики
     в прологе и финале пересчитаются сами */
  const MEET_DATE = new Date(2025, 9, 3, 19, 20, 0);

  /* ---------- ЛЕПЕСТКИ ---------- */
  const petalsBox = document.getElementById('petals');
  const isMobile = window.matchMedia('(max-width: 720px)').matches;
  const petalCount = isMobile ? 8 : 16;

  if (petalsBox) {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < petalCount; i++) {
      const petal = document.createElement('span');
      petal.className = 'petal';
      petal.style.left = (Math.random() * 100) + '%';
      const size = 10 + Math.random() * 10;
      petal.style.width = size + 'px';
      petal.style.height = (size * 1.25) + 'px';
      petal.style.animationDuration = (11 + Math.random() * 10) + 's';
      petal.style.animationDelay = (Math.random() * 12) + 's';
      fragment.appendChild(petal);
    }
    petalsBox.appendChild(fragment);
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

  /* ---------- ЖИВОЙ СЧЁТЧИК ЗНАКОМСТВА ---------- */
  /* Обновляем каждые 5 секунд (точность до минуты) и сразу
     на старте — чтобы цифры стояли до первого тика */
  function tickTimer() {
    const diff = Date.now() - MEET_DATE.getTime();
    if (diff < 0) return; // дата в будущем — счётчик просто молчит

    const totalMinutes = Math.floor(diff / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;

    const pairs = [
      ['tDays', days], ['tHours', hours], ['tMinutes', minutes],
      ['bDays', days], ['bHours', hours], ['bMinutes', minutes]
    ];
    pairs.forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && el.textContent !== String(val)) el.textContent = val;
    });
  }
  tickTimer();
  setInterval(tickTimer, 5000);

  /* ---------- СЦЕНА МЕССЕНДЖЕРА ---------- */
  /* История придумана. from: 'he' — пузыри Марка слева,
     'she' — Алисы справа. Перед его сообщениями показываем
     «печатает…» с задержкой, пропорциональной длине текста */
  const SCRIPT = [
    { from: 'he',  text: 'привет) ты, кажется, оставила книгу на кассе',          time: '02:47' },
    { from: 'he',  text: 'вернее не оставила, а забыла. вернее я её забрал, чтобы не потерялась', time: '02:48' },
    { from: 'she', text: 'в 2:47 ночи ты спасаешь чужие книги?',                  time: '02:51' },
    { from: 'he',  text: 'я дежурный по книгам, ночная смена',                    time: '02:52' },
    { from: 'she', text: 'окей. и что за книга?',                                 time: '02:52' },
    { from: 'he',  text: '«Мастер и Маргарита». страница 214, закладка — билет в кино на «не помню что»', time: '02:53' },
    { from: 'she', text: 'так это моя книга. я её неделю ищу',                    time: '02:54' },
    { from: 'he',  text: 'знаю. страница 214 — это где Мастер сидит в подвале',   time: '02:54' },
    { from: 'she', text: 'ты читал мою книгу?',                                   time: '02:55' },
    { from: 'he',  text: 'только главу. честно. хотя нет, две',                   time: '02:56' },
    { from: 'she', text: 'верну книгу за чашку кофе. у тебя до завтра, до 19:00', time: '02:57' }
  ];

  const chatBox = document.getElementById('chatBox');
  const typingEl = document.getElementById('typing');
  const replayBtn = document.getElementById('chatReplay');
  let playToken = 0; /* отменяет запущенный проигрыш при перезапуске */

  function makeBubble(msg) {
    const bubble = document.createElement('div');
    bubble.className = 'bubble bubble--' + msg.from;
    bubble.innerHTML = '';
    const span = document.createElement('span');
    span.textContent = msg.text;
    const time = document.createElement('span');
    time.className = 'bubble__time';
    time.textContent = msg.time;
    bubble.append(span, time);
    return bubble;
  }

  function playChat() {
    if (!chatBox) return;
    const token = ++playToken;
    chatBox.innerHTML = '';

    SCRIPT.forEach((msg, i) => {
      const prevDelay = i === 0 ? 600 : 900;             /* пауза перед началом реплики */
      const typingTime = Math.min(2400, 500 + msg.text.length * 28); /* «печатает…» */

      setTimeout(() => {
        if (token !== playToken) return; /* сценарий перезапустили — выходим */

        /* «Печатает…» показываем перед репликами Марка:
           на деле — перед любой следующей после паузы */
        const showTyping = i > 0 && SCRIPT[i - 1].from !== msg.from;

        const run = () => {
          chatBox.appendChild(makeBubble(msg));
          chatBox.scrollTop = chatBox.scrollHeight;
        };

        if (showTyping && typingEl) {
          typingEl.hidden = false;
          setTimeout(() => {
            if (token !== playToken) return;
            typingEl.hidden = true;
            run();
          }, typingTime);
        } else {
          run();
        }
      }, i * 1100 + prevDelay);
    });
  }

  if (chatBox) {
    /* Первый запуск — когда сцена появляется в кадре */
    const chatObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          playChat();
          chatObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.35 });
    chatObserver.observe(chatBox);

    if (replayBtn) {
      replayBtn.addEventListener('click', playChat);
    }
  }

  /* ---------- ПОЛАРОИД: ПРОЯВЛЕНИЕ КАДРА ---------- */
  const polaroid = document.getElementById('polaroid');
  if (polaroid) {
    const photoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          polaroid.classList.add('is-developed');
          photoObserver.unobserve(polaroid);
        }
      });
    }, { threshold: 0.5 });
    photoObserver.observe(polaroid);
  }

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

  /* ---------- ПЛАВНЫЙ ПЕРЕХОД ПО ЯКОРЯМ ---------- */
  document.querySelectorAll('[data-goto]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

});
