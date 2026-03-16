/* =============================================
   CHRONO GODS — script.js
   ============================================= */

(function () {
  'use strict';

  /* ---- NAVBAR scroll ---- */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ---- Hamburger menu ---- */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (navLinks.classList.contains('open')) {
      spans[0].style.cssText = 'transform:rotate(45deg) translate(4px,4px);';
      spans[1].style.cssText = 'opacity:0;';
      spans[2].style.cssText = 'transform:rotate(-45deg) translate(4px,-4px);';
    } else {
      spans.forEach(s => s.style.cssText = '');
    }
  });
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => s.style.cssText = '');
    })
  );

  /* ---- Particle system ---- */
  const particleContainer = document.getElementById('particles');
  function createParticle() {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3 + 1;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      bottom:${Math.random()*40}%;
      animation-duration:${Math.random()*6+4}s;
      animation-delay:${Math.random()*4}s;
    `;
    particleContainer.appendChild(p);
    setTimeout(() => p.remove(), 12000);
  }
  for (let i = 0; i < 20; i++) createParticle();
  setInterval(createParticle, 600);

  /* ---- Scroll-reveal animations ---- */
  const animatedEls = document.querySelectorAll('[data-animate]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      const delay = parseInt(target.dataset.delay || 0);
      setTimeout(() => target.classList.add('in-view'), delay);
      revealObserver.unobserve(target);
    });
  }, { threshold: 0.12 });
  animatedEls.forEach(el => revealObserver.observe(el));

  /* ---- Carousel ---- */
  const track       = document.getElementById('carousel-track');
  const prevBtn     = document.getElementById('carousel-prev');
  const nextBtn     = document.getElementById('carousel-next');
  const dotsWrapper = document.getElementById('carousel-dots');
  const progressBar = document.getElementById('carousel-progress-bar');
  const slides      = track ? Array.from(track.children) : [];
  let current = 0;
  let autoplayTimer;
  let visibleCount = window.innerWidth <= 768 ? 1 : 2;

  function buildDots() {
    dotsWrapper.innerHTML = '';
    const count = slides.length - visibleCount + 1;
    for (let i = 0; i <= Math.max(0, slides.length - visibleCount); i++) {
      const d = document.createElement('button');
      d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', `Slide ${i + 1}`);
      d.addEventListener('click', () => goTo(i));
      dotsWrapper.appendChild(d);
    }
  }

  function getSlideWidth() {
    if (!slides.length) return 0;
    return slides[0].offsetWidth + 16;
  }

  function goTo(index) {
    const maxIndex = Math.max(0, slides.length - visibleCount);
    current = Math.min(Math.max(index, 0), maxIndex);
    track.style.transform = `translateX(-${current * getSlideWidth()}px)`;
    dotsWrapper.querySelectorAll('.carousel-dot').forEach((d, i) =>
      d.classList.toggle('active', i === current)
    );
    const total = maxIndex + 1;
    progressBar.style.width = total > 1 ? `${((current + 1) / total) * 100}%` : '100%';
  }

  prevBtn && prevBtn.addEventListener('click', () => { goTo(current - 1); resetAutoplay(); });
  nextBtn && nextBtn.addEventListener('click', () => { goTo(current + 1); resetAutoplay(); });

  /* Touch / drag */
  let startX = 0, dragging = false;
  if (track) {
    track.addEventListener('mousedown', e => { startX = e.clientX; dragging = true; });
    track.addEventListener('mousemove', e => { if (dragging) e.preventDefault(); });
    track.addEventListener('mouseup', e => {
      if (!dragging) return;
      dragging = false;
      const diff = startX - e.clientX;
      if (Math.abs(diff) > 60) goTo(diff > 0 ? current + 1 : current - 1);
    });
    track.addEventListener('mouseleave', () => { dragging = false; });

    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
    }, { passive: true });
  }

  function startAutoplay() {
    autoplayTimer = setInterval(() => {
      const maxIndex = Math.max(0, slides.length - visibleCount);
      goTo(current < maxIndex ? current + 1 : 0);
    }, 4000);
  }
  function resetAutoplay() {
    clearInterval(autoplayTimer);
    startAutoplay();
  }

  window.addEventListener('resize', () => {
    visibleCount = window.innerWidth <= 768 ? 1 : 2;
    buildDots();
    goTo(0);
  });

  if (slides.length) {
    buildDots();
    goTo(0);
    startAutoplay();
  }

  /* ---- Video modal ---- */
  const playBtn    = document.getElementById('play-btn');
  const videoModal = document.getElementById('video-modal');
  const closeBtn   = document.getElementById('video-close');
  const brandVideo = document.getElementById('brand-video');

  playBtn && playBtn.addEventListener('click', () => {
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (brandVideo) {
      brandVideo.play().catch(() => {});
    }
  });
  closeBtn && closeBtn.addEventListener('click', closeModal);
  videoModal && videoModal.addEventListener('click', e => {
    if (e.target === videoModal) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
  function closeModal() {
    videoModal && videoModal.classList.remove('active');
    document.body.style.overflow = '';
    if (brandVideo) {
      brandVideo.pause();
      brandVideo.currentTime = 0;
    }
  }

  /* ---- Registration form ---- */
  const form        = document.getElementById('register-form');
  const successBox  = document.getElementById('form-success');
  const submitBtn   = document.getElementById('register-submit-btn');

  form && form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name  = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    if (!name || !email) {
      shakeForm();
      return;
    }
    if (!isValidEmail(email)) {
      document.getElementById('reg-email').style.borderColor = '#ff4d6d';
      setTimeout(() => document.getElementById('reg-email').style.borderColor = '', 2000);
      return;
    }
    /* Show loading */
    submitBtn.querySelector('.btn-text').style.display = 'none';
    submitBtn.querySelector('.btn-loading').style.display = 'flex';
    submitBtn.disabled = true;

    await new Promise(r => setTimeout(r, 1800));

    form.style.display = 'none';
    successBox.style.display = 'block';
    successBox.style.animation = 'fadeInUp 0.6s ease both';
  });

  function isValidEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }
  function shakeForm() {
    const card = document.querySelector('.register-form-card');
    card.style.animation = 'shake 0.4s ease';
    setTimeout(() => card.style.animation = '', 400);
  }

  /* ---- Smooth scrolling for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---- Active nav link on scroll ---- */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) {
        navAnchors.forEach(a => {
          a.style.color = '';
          if (a.getAttribute('href') === `#${target.id}`) {
            a.style.color = 'var(--white)';
          }
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => sectionObserver.observe(s));

  /* ---- Counter animation for brand stats ---- */
  const counters = document.querySelectorAll('.stat-number');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (!isIntersecting) return;
      const final = target.textContent;
      if (!isNaN(parseInt(final))) {
        animateCounter(target, parseInt(final));
      }
      counterObserver.unobserve(target);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => counterObserver.observe(c));

  function animateCounter(el, target) {
    let current = 0;
    const step = target / 40;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { el.textContent = target; clearInterval(timer); return; }
      el.textContent = Math.floor(current);
    }, 30);
  }

  /* ---- Parallax subtle effect on hero ---- */
  const heroBgImg = document.querySelector('.hero-bg-img');
  window.addEventListener('scroll', () => {
    if (!heroBgImg) return;
    const scrolled = window.scrollY;
    heroBgImg.style.transform = `scale(1.05) translateY(${scrolled * 0.15}px)`;
  }, { passive: true });

})();

/* Shake keyframe injected dynamically */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20%      { transform: translateX(-8px); }
  40%      { transform: translateX(8px); }
  60%      { transform: translateX(-6px); }
  80%      { transform: translateX(6px); }
}`;
document.head.appendChild(shakeStyle);
