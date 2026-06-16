/* =========================================================
   ROYAL TASTE — JavaScript
   ========================================================= */

'use strict';

/* ── Utility ─────────────────────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ====================================================
   1. NAVBAR — scroll effect + active link + hamburger
   ==================================================== */
(function initNavbar() {
  const navbar    = qs('#navbar');
  const hamburger = qs('#hamburger');
  const navLinks  = qs('#nav-links');
  const links     = qsa('.nav-link');

  // Scroll class
  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveLink();
    toggleBackToTop();
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // run on init

  // Hamburger toggle
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.classList.toggle('nav-open', isOpen);
  });

  // Close nav on link click (mobile)
  links.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    });
  });

  // Close nav when clicking overlay (mobile)
  document.addEventListener('click', (e) => {
    if (
      document.body.classList.contains('nav-open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    }
  });

  // Active link on scroll (Intersection Observer)
  function updateActiveLink() {
    const sections = qsa('section[id], div[id]');
    let current = '';

    sections.forEach(section => {
      const top = section.getBoundingClientRect().top;
      if (top <= 100) current = section.id;
    });

    links.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === current);
    });
  }
})();

/* ====================================================
   2. SCROLL ANIMATIONS (AOS-like, no external library)
   ==================================================== */
(function initScrollAnimations() {
  const elements = qsa('[data-aos]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
})();

/* ====================================================
   3. MENU TABS
   ==================================================== */
(function initMenuTabs() {
  const tabs   = qsa('.menu-tab');
  const panels = qsa('.menu-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      // Update tab states
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Update panel visibility with fade transition
      panels.forEach(panel => {
        if (panel.id === `panel-${target}`) {
          panel.style.opacity = '0';
          panel.classList.add('active');
          requestAnimationFrame(() => {
            panel.style.transition = 'opacity 0.4s ease';
            panel.style.opacity = '1';
          });
          // Re-trigger AOS for newly visible cards
          qsa('[data-aos]', panel).forEach(el => {
            el.classList.remove('aos-animate');
            setTimeout(() => el.classList.add('aos-animate'), 50);
          });
        } else {
          panel.classList.remove('active');
          panel.style.opacity = '';
          panel.style.transition = '';
        }
      });
    });
  });
})();

/* ====================================================
   4. RESERVATION FORM
   ==================================================== */
(function initReservationForm() {
  const form  = qs('#reservation-form');
  const toast = qs('#toast');

  // Set min date to today
  const dateInput = qs('#res-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation
    const required = form.querySelectorAll('[required]');
    let valid = true;

    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#ef4444';
        field.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.15)';
        valid = false;
      } else {
        field.style.borderColor = '';
        field.style.boxShadow = '';
      }
    });

    // Email format validation
    const email = qs('#res-email');
    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.style.borderColor = '#ef4444';
      email.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.15)';
      valid = false;
    }

    if (!valid) return;

    // Simulate submission
    const btn = qs('#submit-reservation');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Processing...</span>';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = '<i class="fa-solid fa-calendar-check"></i> <span>Reserve My Table</span>';
      btn.disabled = false;
      form.reset();
      showToast();
    }, 1800);
  });

  // Remove error state on input
  form.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
      if (e.target.value.trim()) {
        e.target.style.borderColor = '';
        e.target.style.boxShadow = '';
      }
    }
  });

  function showToast() {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4500);
  }
})();

/* ====================================================
   5. BACK TO TOP BUTTON
   ==================================================== */
function toggleBackToTop() {
  const btn = qs('#back-to-top');
  if (!btn) return;
  btn.classList.toggle('visible', window.scrollY > 400);
}

(function initBackToTop() {
  const btn = qs('#back-to-top');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ====================================================
   6. SET COPYRIGHT YEAR
   ==================================================== */
(function setYear() {
  const el = qs('#year');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ====================================================
   7. SMOOTH SCROLL FOR ANCHOR LINKS
   ==================================================== */
(function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const id = anchor.getAttribute('href');
    if (id === '#') return;
    const target = qs(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();

/* ====================================================
   8. HERO PARALLAX (subtle)
   ==================================================== */
(function initParallax() {
  const heroBg = qs('#hero-bg');
  if (!heroBg) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const rate = scrollY * 0.3;
    heroBg.style.transform = `scale(1.05) translateY(${rate}px)`;
  }, { passive: true });
})();

/* ====================================================
   9. GALLERY KEYBOARD NAVIGATION
   ==================================================== */
(function initGallery() {
  const items = qsa('.gallery-item');
  items.forEach(item => {
    item.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.querySelector('img')?.click();
      }
    });
  });
})();

/* ====================================================
   10. NUMBER COUNTER ANIMATION (stats)
   ==================================================== */
(function initCounters() {
  const stats = qsa('.stat-num');

  const animateCounter = (el, target, suffix) => {
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;
    let current = 0;
    const increment = target / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        el.textContent = target + suffix;
        clearInterval(timer);
      } else {
        el.textContent = Math.floor(current) + suffix;
      }
    }, stepTime);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const text = el.textContent;
        const suffix = text.replace(/[0-9]/g, '').replace('+', '') + (text.includes('+') ? '+' : '');
        const num = parseInt(text.replace(/\D/g, ''), 10);
        animateCounter(el, num, suffix);
        observer.unobserve(el);
      });
    },
    { threshold: 0.8 }
  );

  stats.forEach(stat => observer.observe(stat));
})();

/* ====================================================
   11. FLOATING PARTICLE EFFECT in hero (subtle)
   ==================================================== */
(function initParticles() {
  const hero = qs('.hero');
  if (!hero || window.innerWidth < 768) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    opacity: 0.4;
  `;
  hero.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let particles = [];
  const gold = 'rgba(201, 168, 76, ';

  function resize() {
    canvas.width  = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * canvas.width;
      this.y    = canvas.height + Math.random() * 100;
      this.size = Math.random() * 2 + 0.5;
      this.speedY = Math.random() * 0.8 + 0.3;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.1;
    }
    update() {
      this.y -= this.speedY;
      this.x += this.speedX;
      if (this.y < -10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = gold + this.opacity + ')';
      ctx.fill();
    }
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  for (let i = 0; i < 50; i++) {
    const p = new Particle();
    p.y = Math.random() * canvas.height;
    particles.push(p);
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }

  animate();
})();
