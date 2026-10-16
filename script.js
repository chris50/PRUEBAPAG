// Año del footer
document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Navegación local: borde al hacer scroll
const lnav = document.getElementById('lnav');
const onScroll = () => lnav.classList.toggle('is-stuck', window.scrollY > 120);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Anclas: resaltar la sección visible
const anchorLinks = [...document.querySelectorAll('.anchors a')];
const targets = anchorLinks
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);
const anchorObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    anchorLinks.forEach(a =>
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id)
    );
  });
}, { rootMargin: '-40% 0px -55% 0px' });
targets.forEach(t => anchorObserver.observe(t));

// Carrusel de destacados
const carousel = document.getElementById('carousel');
const slides = [...carousel.querySelectorAll('.slide')];
const dotsEl = document.getElementById('dots');
const playBtn = document.getElementById('playBtn');
let current = 0;
let playing = !reduceMotion;
let timer = null;

slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'dot';
  dot.setAttribute('aria-label', `Ir a la diapositiva ${i + 1}`);
  dot.addEventListener('click', () => { goTo(i); });
  dotsEl.appendChild(dot);
});
const dots = [...dotsEl.children];

function setActive(i) {
  current = i;
  dots.forEach((d, idx) => d.classList.toggle('is-active', idx === i));
}

function goTo(i) {
  const slide = slides[i];
  carousel.scrollTo({ left: slide.offsetLeft - slides[0].offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
  setActive(i);
}

// Actualiza los puntos cuando el usuario desliza
let scrollTick;
carousel.addEventListener('scroll', () => {
  clearTimeout(scrollTick);
  scrollTick = setTimeout(() => {
    const base = slides[0].offsetLeft;
    let nearest = 0, min = Infinity;
    slides.forEach((s, i) => {
      const d = Math.abs(s.offsetLeft - base - carousel.scrollLeft);
      if (d < min) { min = d; nearest = i; }
    });
    setActive(nearest);
  }, 80);
}, { passive: true });

function start() {
  stop();
  timer = setInterval(() => goTo((current + 1) % slides.length), 5000);
}
function stop() { clearInterval(timer); timer = null; }

function renderPlay() {
  playBtn.classList.toggle('is-paused', !playing);
  playBtn.setAttribute('aria-label', playing ? 'Pausar carrusel' : 'Reproducir carrusel');
}
playBtn.addEventListener('click', () => {
  playing = !playing;
  playing ? start() : stop();
  renderPlay();
});
carousel.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') goTo(Math.min(current + 1, slides.length - 1));
  if (e.key === 'ArrowLeft') goTo(Math.max(current - 1, 0));
});

setActive(0);
renderPlay();
if (playing) start();

// Filtro de programas
const filterBtns = document.querySelectorAll('.filters .pill');
const rows = document.querySelectorAll('#rows li');
filterBtns.forEach(btn => btn.addEventListener('click', () => {
  filterBtns.forEach(b => b.classList.remove('is-active'));
  btn.classList.add('is-active');
  const f = btn.dataset.filter;
  rows.forEach(r => { r.hidden = f !== 'todos' && r.dataset.cat !== f; });
}));

// Pasos del método (acordeón)
const stepItems = document.querySelectorAll('#steps li');
stepItems.forEach(li => {
  li.querySelector('button').addEventListener('click', () => {
    stepItems.forEach(item => {
      item.classList.remove('is-open');
      item.querySelector('button').setAttribute('aria-expanded', 'false');
    });
    li.classList.add('is-open');
    li.querySelector('button').setAttribute('aria-expanded', 'true');
  });
});

// Aparición suave de secciones
const revealEls = document.querySelectorAll('.hero__title, .stage, .band__head, .section__title, .rows, .editorial__text, .contact');
revealEls.forEach(el => el.classList.add('reveal'));
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

// Formulario (validación en el navegador)
const form = document.getElementById('form');
const msg = document.getElementById('formMsg');
form.addEventListener('submit', e => {
  e.preventDefault();
  const nombre = form.nombre;
  const correo = form.correo;
  const okName = nombre.value.trim().length > 1;
  const okMail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.value);
  nombre.classList.toggle('is-error', !okName);
  correo.classList.toggle('is-error', !okMail);
  if (!okName || !okMail) {
    msg.textContent = 'Revisa tu nombre y tu correo, por favor.';
    return;
  }
  msg.textContent = `¡Gracias, ${nombre.value.trim()}! Te escribiremos pronto.`;
  form.reset();
});