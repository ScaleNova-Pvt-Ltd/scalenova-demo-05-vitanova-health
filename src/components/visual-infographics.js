/**
 * ScaleNova EliteOS — Visual Infographics & Interactive Engine
 * Handles count-up clinical metrics, 3D card tilt, and interactive protocol switchers
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. KPI Counter Animation
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.getAttribute('data-counter'));
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          const isDecimal = target.toString().includes('.');
          const duration = 1600;
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out quartic
            const ease = 1 - Math.pow(1 - progress, 4);
            const currentVal = target * ease;

            el.textContent = prefix + (isDecimal ? currentVal.toFixed(1) : Math.floor(currentVal)) + suffix;

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = prefix + (isDecimal ? target.toFixed(1) : target) + suffix;
            }
          }

          requestAnimationFrame(updateCounter);
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.2 });

    counters.forEach(c => observer.observe(c));
  }

  // 2. 3D Card Tilt
  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // 3. Interactive Clinical Switchers
  const switchers = document.querySelectorAll('.tech-switcher');
  switchers.forEach(switcher => {
    const buttons = switcher.querySelectorAll('.switcher-btn');
    const panels = switcher.querySelectorAll('.switcher-panel');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');

        buttons.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const activePanel = switcher.querySelector(`#${targetId}`);
        if (activePanel) {
          activePanel.classList.add('active');
        }
      });
    });
  });
});
