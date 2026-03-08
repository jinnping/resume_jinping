    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      document.getElementById('theme-btn').textContent = theme === 'dark' ? '☀' : '☾';
      localStorage.setItem('jp-theme', theme);
    }

    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    }

    document.getElementById('theme-btn').addEventListener('click', toggleTheme);


    function applyLanguage(lang, animate = true) {
      const t    = TRANSLATIONS[lang];
      const els  = document.querySelectorAll('[data-i18n]');

      const swap = () => {
        els.forEach(el => {
          const key = el.getAttribute('data-i18n');
          if (t[key] !== undefined) el.innerHTML = t[key];
          if (animate) el.style.opacity = '1';
        });

        document.getElementById('chat-name-el').textContent    = t['chat-name'];
        document.getElementById('chat-status-el').textContent  = t['chat-status'];
        document.getElementById('chat-input').placeholder      = t['chat-placeholder'];
        document.getElementById('chat-init-msg').textContent   = t['chat-init'];

        typingRoles = t['typing-roles'];
        typingIndex = 0;
        charIndex   = 0;
        isDeleting  = false;
        clearTimeout(typingTimer);
        document.getElementById('typing-text').textContent = '';
        typingTimer = setTimeout(typeNextChar, 400);
      };

      if (animate) {
        els.forEach(el => { el.style.opacity = '0'; });
        setTimeout(swap, 200);
      } else {
        swap();
      }
    }

    function setLanguage(lang, animate = true) {
      currentLang = lang;
      document.documentElement.setAttribute('data-lang', lang);
      document.getElementById('lang-btn').textContent = lang === 'en' ? '中文' : 'EN';
      localStorage.setItem('jp-lang', lang);
      applyLanguage(lang, animate);
    }

    document.getElementById('lang-btn').addEventListener('click', () => {
      setLanguage(currentLang === 'en' ? 'zh' : 'en');
    });


    applyTheme(localStorage.getItem('jp-theme') || 'light');
    setLanguage(localStorage.getItem('jp-lang') || 'en', false);


    const cursorOuter = document.getElementById('cursor-outer');
    const cursorDot   = document.getElementById('cursor-dot');
    let mouseX = 0, mouseY = 0;  
    let ringX  = 0, ringY  = 0; 

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top  = mouseY + 'px';

      document.getElementById('hero-glow').style.left = mouseX + 'px';
      document.getElementById('hero-glow').style.top  = mouseY + 'px';
    });

    (function animateCursorRing() {
      ringX += (mouseX - ringX) * 0.1;
      ringY += (mouseY - ringY) * 0.1;
      cursorOuter.style.left = ringX + 'px';
      cursorOuter.style.top  = ringY + 'px';
      requestAnimationFrame(animateCursorRing);
    })();

    document.addEventListener('click', e => {
      const ripple = document.createElement('div');
      ripple.className  = 'cursor-ripple';
      ripple.style.left = e.clientX + 'px';
      ripple.style.top  = e.clientY + 'px';
      ripple.style.width = ripple.style.height = '40px';
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    });

    let lastTrailTime = 0;
    document.addEventListener('mousemove', e => {
      const now = Date.now();
      if (now - lastTrailTime < 60) return;
      lastTrailTime = now;

      const particle = document.createElement('div');
      particle.className  = 'cursor-trail';
      particle.style.left = e.clientX + 'px';
      particle.style.top  = e.clientY + 'px';
      particle.style.opacity = '0.4';
      particle.style.width = particle.style.height = (Math.random() * 3 + 2) + 'px';
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 600);
    });

    const hoverTargets = 'a, button, .tag, .pill, .suggestion-chip, .edu-card, .award-card, .research-card--featured';
    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    document.querySelectorAll('.btn-magnetic').forEach(btn => {
      btn.addEventListener('mouseenter', () => document.body.classList.add('cursor-magnetic'));
      btn.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-magnetic');
        btn.style.transform = '';
      });
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const offsetX = (e.clientX - rect.left - rect.width  / 2) * 0.25;
        const offsetY = (e.clientY - rect.top  - rect.height / 2) * 0.3;
        btn.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      });
    });

    document.querySelectorAll('.edu-card, .award-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width  - 0.5;
        const y = (e.clientY - rect.top)  / rect.height - 0.5;
        card.style.transform = `perspective(600px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });



    window.addEventListener('scroll', () => {
      document.getElementById('navbar').classList.toggle('scrolled', scrollY > 60);
    });


    const typingEl = document.getElementById('typing-text');

    function typeNextChar() {
      const currentRole = typingRoles[typingIndex];

      if (!isDeleting) {
        typingEl.textContent = currentRole.slice(0, ++charIndex);
        if (charIndex === currentRole.length) {
          isDeleting = true;
          typingTimer = setTimeout(typeNextChar, 2200);
          return;
        }
        typingTimer = setTimeout(typeNextChar, 65);
      } else {
        typingEl.textContent = currentRole.slice(0, --charIndex);
        if (charIndex === 0) {
          isDeleting  = false;
          typingIndex = (typingIndex + 1) % typingRoles.length;
          typingTimer = setTimeout(typeNextChar, 350);
          return;
        }
        typingTimer = setTimeout(typeNextChar, 38);
      }
    }

    const scrollObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        entry.target.querySelectorAll('.skill-bar__fill').forEach(bar => {
          bar.style.width = bar.dataset.width + '%';
        });
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('section').forEach(section => scrollObserver.observe(section));
