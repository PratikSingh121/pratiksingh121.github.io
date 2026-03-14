/* ============================================
   PRATIK SINGH — Portfolio Script
   ============================================ */

(function () {
  'use strict';

  /* ─── Scroll Progress Bar ───────────────── */
  const progressBar = document.getElementById('progress-bar');
  function updateProgress() {
    if (!progressBar) return;
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? scrolled / total : 0;
    progressBar.style.transform = `scaleX(${pct})`;
  }

  /* ─── Nav: scroll style ─────────────────── */
  const nav = document.getElementById('nav');
  function updateNav() {
    if (!nav) return;
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  /* ─── Nav: active link highlight ───────── */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function updateActiveLink() {
    if (!navLinks.length || !sections.length) return;
    let currentId = '';
    sections.forEach((sec) => {
      const top = sec.getBoundingClientRect().top;
      if (top <= window.innerHeight * 0.4) {
        currentId = sec.id;
      }
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('active', href === currentId);
    });
  }

  /* ─── Scroll handler (throttled) ────────── */
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateProgress();
        updateNav();
        updateActiveLink();
        checkBackToTop();
        updateQuestVisibility();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  /* ─── Mobile Menu ───────────────────────── */
  const menuToggle = document.getElementById('menu-toggle');
  const navLinksContainer = document.getElementById('nav-links');

  if (menuToggle && navLinksContainer) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinksContainer.classList.toggle('open');
      menuToggle.classList.toggle('open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinksContainer.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        navLinksContainer.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ─── Reveal on Scroll ──────────────────── */
  const revealEls = document.querySelectorAll('.reveal-up');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  /* ─── Theme Toggle ──────────────────────── */
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  const saved = localStorage.getItem('ps-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (prefersDark ? 'dark' : 'light');
  html.setAttribute('data-theme', initial);

  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('ps-theme', next);
  });

  /* ─── Back to Top ───────────────────────── */
  const backToTop = document.getElementById('back-to-top');

  function checkBackToTop() {
    if (!backToTop) return;
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ─── Smooth scroll for all anchor links ─ */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const targetQuery = a.getAttribute('href');
      if (targetQuery === '#') return;
      const target = document.querySelector(targetQuery);
      if (target) {
        e.preventDefault();
        const offset = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    });
  });

  /* ─── Hero: cursor-follow subtle glow ───── */
  const hero = document.querySelector('.hero');
  if (hero && window.matchMedia('(hover: hover)').matches) {
    let ghostX = 0;
    let ghostY = 0;
    let realX = 0;
    let realY = 0;

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      realX = e.clientX - rect.left;
      realY = e.clientY - rect.top;
    });

    (function animateGlow() {
      ghostX += (realX - ghostX) * 0.08;
      ghostY += (realY - ghostY) * 0.08;
      hero.style.background = `radial-gradient(
        600px circle at ${ghostX}px ${ghostY}px,
        var(--accent-dim) 0%,
        transparent 70%
      )`;
      requestAnimationFrame(animateGlow);
    })();
  }

  /* ─── EASTER EGGS & QUEST LOGIC ────────── */

  const questsFound = new Set();
  const eggCounter = document.getElementById('egg-counter');
  const questTracker = document.getElementById('quest-tracker');
  const questToggle = document.getElementById('quest-toggle');
  const questLabel = document.querySelector('.quest-label');
  const heroTag = document.querySelector('.hero-tag');
  const themeToggleBtn = document.getElementById('theme-toggle');
  const hiddenQuoteDefaultText = '"Curiosity is the engine of achievement."';
  const isTouchDevice =
    window.matchMedia('(hover: none)').matches ||
    navigator.maxTouchPoints > 0 ||
    'ontouchstart' in window;

  function showQuestToast(message) {
    const toast = document.createElement('div');
    toast.className = 'quest-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 250);
    }, 1700);
  }

  function burstLogoSparks(target) {
    if (!target) return;
    const sparkCount = 10;
    for (let i = 0; i < sparkCount; i++) {
      const spark = document.createElement('span');
      spark.className = 'logo-spark';
      spark.style.setProperty('--angle', `${(360 / sparkCount) * i}deg`);
      target.appendChild(spark);
      setTimeout(() => spark.remove(), 750);
    }
  }

  function markFound(id) {
    if (questsFound.has(id)) return;
    questsFound.add(id);
    if (eggCounter) {
      eggCounter.textContent = `${questsFound.size} / 5`;
      eggCounter.classList.add('found-flash');
      setTimeout(() => eggCounter.classList.remove('found-flash'), 700);
    }
    
    if (questsFound.size === 5) {
      if (questLabel) {
        questLabel.textContent = 'Quest Complete!';
      }
      if (questTracker) {
        questTracker.classList.add('quest-complete');
      }
      showQuestToast('All 5 secrets found. Quest complete.');
      return;
    }

    const rewardLabels = {
      1: 'Secret Greeting unlocked ✨',
      2: 'Hidden interaction discovered',
      3: 'Logo ritual completed ⚡',
      4: 'Theme rhythm cracked 🎛️',
      5: 'Infinity secret revealed ∞'
    };
    showQuestToast(rewardLabels[id] || 'Secret found');
  }

  function updateQuestVisibility() {
    if (!questTracker) return;
    if (window.scrollY > 40) {
      questTracker.classList.add('visible');
    } else {
      questTracker.classList.remove('visible');
    }
  }

  function setQuestCollapsed(collapsed) {
    if (!questTracker || !questToggle) return;
    questTracker.classList.toggle('collapsed', collapsed);
    questToggle.textContent = collapsed ? '+' : '−';
    questToggle.setAttribute('aria-expanded', String(!collapsed));
    questToggle.setAttribute('aria-label', collapsed ? 'Expand quest hints' : 'Minimize quest hints');
    localStorage.setItem('ps-quest-collapsed', collapsed ? '1' : '0');
  }

  if (questTracker && questToggle) {
    const savedCollapsed = localStorage.getItem('ps-quest-collapsed') === '1';
    setQuestCollapsed(savedCollapsed);
    questToggle.addEventListener('click', () => {
      const collapsed = !questTracker.classList.contains('collapsed');
      setQuestCollapsed(collapsed);
    });
  }

  const questEggBtn = document.getElementById('quest-egg-btn');
  if (questEggBtn) {
    questEggBtn.addEventListener('click', () => setQuestCollapsed(false));
  }

  // 🥚 1 + 2: platform-specific secrets
  let typingBuffer = '';
  let sudoInput = '';
  let heroTapCount = 0;
  let heroTapResetTimer;
  let questPressTimer;

  if (isTouchDevice) {
    if (heroTag) {
      heroTag.addEventListener('click', () => {
        heroTapCount++;
        clearTimeout(heroTapResetTimer);
        heroTapResetTimer = setTimeout(() => {
          heroTapCount = 0;
        }, 1300);

        if (heroTapCount >= 3) {
          markFound(1);
          heroTag.classList.add('tag-flash');
          setTimeout(() => heroTag.classList.remove('tag-flash'), 900);
          heroTapCount = 0;
        }
      });
    }

    if (questTracker) {
      questTracker.addEventListener('touchstart', () => {
        questTracker.classList.add('press-glow');
        questPressTimer = setTimeout(() => {
          markFound(2);
        }, 1200);
      }, { passive: true });

      const cancelQuestPress = () => {
        clearTimeout(questPressTimer);
        questTracker.classList.remove('press-glow');
      };

      questTracker.addEventListener('touchend', cancelQuestPress, { passive: true });
      questTracker.addEventListener('touchcancel', cancelQuestPress, { passive: true });
    }
  } else {
    const greetingTrigger = 'hello';

    document.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();

      if (key.length === 1) {
        typingBuffer += key;
        if (typingBuffer.length > 24) {
          typingBuffer = typingBuffer.substring(typingBuffer.length - 24);
        }
        if (typingBuffer.includes(greetingTrigger)) {
          const achievementModal = document.getElementById('achievement-modal');
          const title = achievementModal ? achievementModal.querySelector('h2') : null;
          const body = achievementModal ? achievementModal.querySelector('p') : null;
          const meta = achievementModal ? achievementModal.querySelector('.achievement-meta') : null;
          if (title) title.textContent = 'Secret Greeting Unlocked';
          if (body) body.textContent = 'You discovered the hidden greeting by typing hello.';
          if (meta) meta.textContent = 'Difficulty: Easy';
          showModal('achievement-modal');
          markFound(1);
          typingBuffer = '';
        }
      }

      sudoInput += key;
      if (sudoInput.includes('sudo')) {
        showModal('sudo-modal');
        markFound(2);
        sudoInput = '';
        setTimeout(() => closeModal('sudo-modal'), 3500);
      }
      if (sudoInput.length > 20) {
        sudoInput = sudoInput.substring(sudoInput.length - 10);
      }
    });
  }

  // 🥚 3: Logo click 5 times
  const logo = document.getElementById('main-logo');
  let logoClicks = 0;
  if (logo) {
    logo.addEventListener('click', () => {
      logoClicks++;
      logo.classList.add('logo-tap');
      setTimeout(() => logo.classList.remove('logo-tap'), 160);

      if (logoClicks === 5) {
        markFound(3);
        burstLogoSparks(logo);
        logo.classList.add('logo-flash');
        setTimeout(() => logo.classList.remove('logo-flash'), 1400);
        logoClicks = 0;
      }
    });
  }

  // 🥚 4: Theme rhythm (works on desktop + mobile)
  let themeToggleStreak = 0;
  let themeToggleResetTimer;
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      themeToggleStreak += 1;
      clearTimeout(themeToggleResetTimer);
      themeToggleResetTimer = setTimeout(() => {
        themeToggleStreak = 0;
      }, 1800);

      if (themeToggleStreak >= 4) {
        markFound(4);
        themeToggleStreak = 0;
      }
    });
  }

  // 🥚 5: Infinity Hover
  const infinityStat = document.getElementById('infinity-stat');
  const hiddenQuote = document.getElementById('hidden-quote');
  let hoverTimer;
  let hoverCountdown;
  let infinityUnlocked = false;

  const infinityHoldSeconds = isTouchDevice ? 2 : 3;

  function startInfinitySecret() {
    if (!infinityStat || infinityUnlocked) return;

      infinityStat.classList.add('infinity-glow');

      let secondsLeft = infinityHoldSeconds;
      if (hiddenQuote && !infinityUnlocked) {
        hiddenQuote.textContent = `Stay a little longer... ${secondsLeft}s`;
        hiddenQuote.style.opacity = '0.8';
      }

      clearInterval(hoverCountdown);
      hoverCountdown = setInterval(() => {
        if (infinityUnlocked) return;
        secondsLeft -= 1;
        if (hiddenQuote && secondsLeft > 0) {
          hiddenQuote.textContent = `Stay a little longer... ${secondsLeft}s`;
        }
      }, 1000);

      hoverTimer = setTimeout(() => {
        infinityUnlocked = true;
        if (hiddenQuote) {
          hiddenQuote.textContent = hiddenQuoteDefaultText;
          hiddenQuote.style.opacity = '1';
        }
        markFound(5);
      }, infinityHoldSeconds * 1000);
  }

  function stopInfinitySecret() {
    if (!infinityStat) return;

      clearTimeout(hoverTimer);
      clearInterval(hoverCountdown);
      if (!infinityUnlocked) {
        infinityStat.classList.remove('infinity-glow');
        if (hiddenQuote) {
          hiddenQuote.textContent = hiddenQuoteDefaultText;
          hiddenQuote.style.opacity = '0';
        }
      }
  }

  if (infinityStat) {
    infinityStat.addEventListener('mouseenter', startInfinitySecret);
    infinityStat.addEventListener('mouseleave', stopInfinitySecret);
    infinityStat.addEventListener('touchstart', startInfinitySecret, { passive: true });
    infinityStat.addEventListener('touchend', stopInfinitySecret, { passive: true });
    infinityStat.addEventListener('touchcancel', stopInfinitySecret, { passive: true });
  }

  // Hint Quest Logic
  const hintText = document.getElementById('hint-text');
  const nextHintBtn = document.getElementById('next-hint');
  const desktopClues = [
    { id: 1, text: 'A polite five-letter greeting can unlock something.' },
    { id: 2, text: 'A familiar admin command (s__o) wakes a fake terminal.' },
    { id: 3, text: 'The PS circle rewards commitment, not a single click.' },
    { id: 4, text: 'Flip day and night in quick rhythm.' },
    { id: 5, text: 'Infinity answers those who pause for a moment.' }
  ];

  const mobileClues = [
    { id: 1, text: 'The intro text likes quick repeated taps.' },
    { id: 2, text: 'One panel reacts to a patient press-and-hold.' },
    { id: 3, text: 'The PS circle rewards commitment, not a single tap.' },
    { id: 4, text: 'Switch day and night quickly a few times.' },
    { id: 5, text: 'Infinity responds to a steady finger.' }
  ];

  const clues = isTouchDevice ? mobileClues : desktopClues;
  let currentClue = -1;

  if (nextHintBtn) {
    nextHintBtn.addEventListener('click', () => {
      const pendingClues = clues.filter((clue) => !questsFound.has(clue.id));
      const cluePool = pendingClues.length ? pendingClues : clues;
      currentClue = (currentClue + 1) % cluePool.length;

      if (!hintText) return;

      hintText.style.opacity = '0';
      setTimeout(() => {
        hintText.textContent = cluePool[currentClue].text;
        hintText.style.opacity = '1';
      }, 200);
    });
  }

  /* ─── Modal Functions ──────────────────── */
  function showModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    if (!document.querySelector('.modal.active')) {
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      closeModal(modal.id);
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      closeModal(e.target.id);
    }
  });

  window.addEventListener('beforeunload', () => {
    clearTimeout(heroTapResetTimer);
    clearTimeout(questPressTimer);
    clearTimeout(themeToggleResetTimer);
    clearTimeout(hoverTimer);
    clearInterval(hoverCountdown);
  });

  /* ─── Skill list: staggered reveal ──────── */
  const skillGroups = document.querySelectorAll('.skill-group');
  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const items = entry.target.querySelectorAll('.skill-list li');
          items.forEach((li, i) => {
            li.style.transitionDelay = `${i * 60}ms`;
            li.style.opacity = '0';
            li.style.transform = 'translateX(-10px)';
            requestAnimationFrame(() => {
              li.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
              li.style.opacity = '1';
              li.style.transform = 'translateX(0)';
            });
          });
          skillObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  skillGroups.forEach((g) => skillObserver.observe(g));

  /* ─── Init ──────────────────────────────── */
  updateNav();
  updateActiveLink();
  updateProgress();
  checkBackToTop();
  updateQuestVisibility();

})();
