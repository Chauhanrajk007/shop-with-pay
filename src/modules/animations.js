// Animations Module â€” LuxCart

export function initRevealAnimations() {
  const reveals = document.querySelectorAll('.reveal-up, .reveal-scale');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );
  reveals.forEach((el) => observer.observe(el));
}

export function initCounterAnimation() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.target);
          animateCounter(el, 0, target, 2000);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((counter) => observer.observe(counter));
}

function animateCounter(element, start, end, duration) {
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (end - start) * eased);
    element.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

export function initParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'hero-particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.animationDelay = `${Math.random() * 8}s`;
    particle.style.animationDuration = `${6 + Math.random() * 6}s`;
    particle.style.width = `${2 + Math.random() * 3}px`;
    particle.style.height = particle.style.width;
    particle.style.opacity = `${0.2 + Math.random() * 0.5}`;
    container.appendChild(particle);
  }
}

export function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow || 'ontouchstart' in window) return;
  let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    glow.classList.add('active');
  });
  document.addEventListener('mouseleave', () => glow.classList.remove('active'));
  function animate() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.left = `${glowX}px`;
    glow.style.top = `${glowY}px`;
    requestAnimationFrame(animate);
  }
  animate();
}

export function initNavScroll() {
  const nav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  });
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.dataset.section === sectionId);
          });
        }
      });
    },
    { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' }
  );
  sections.forEach((section) => sectionObserver.observe(section));
}

export function initMobileMenu() {
  const hamburger = document.getElementById('hamburger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  if (!hamburger || !mobileMenu) return;
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.classList.toggle('no-scroll');
  });
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.classList.remove('no-scroll');
    });
  });
}

export function initCountdown() {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 12);
  endDate.setHours(endDate.getHours() + 8);
  endDate.setMinutes(endDate.getMinutes() + 45);
  function update() {
    const diff = endDate - new Date();
    if (diff <= 0) return;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);
    const el = (id) => document.getElementById(id);
    if (el('timer-days')) el('timer-days').textContent = String(days).padStart(2, '0');
    if (el('timer-hours')) el('timer-hours').textContent = String(hours).padStart(2, '0');
    if (el('timer-mins')) el('timer-mins').textContent = String(mins).padStart(2, '0');
    if (el('timer-secs')) el('timer-secs').textContent = String(secs).padStart(2, '0');
  }
  update();
  setInterval(update, 1000);
}

export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });
}

export function initPreloader() {
  return new Promise((resolve) => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => { preloader.classList.add('hidden'); resolve(); }, 2000);
  });
}

export function initTiltEffect() {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -3;
      const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 3;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

