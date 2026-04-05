/**
 * Landing Page — Interactions & QR Code Generation
 */
document.addEventListener('DOMContentLoaded', () => {
  // --- Navbar scroll effect ---
  const navbar = document.getElementById('navbar');
  const handleScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  // --- Scroll reveal animations ---
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );
  revealElements.forEach((el) => revealObserver.observe(el));

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- QR Code Generation ---
  generateQRCode();
});

function generateQRCode() {
  const container = document.getElementById('qr-code-container');
  if (!container) return;

  // Build AR page URL relative to current page
  const currentUrl = window.location.href;
  const arUrl = new URL('ar.html', currentUrl).href;

  // Check if QRCode library is loaded
  if (typeof QRCode === 'undefined') {
    // Fallback: show a styled placeholder
    container.innerHTML = `
      <div style="width: 200px; height: 200px; display: flex; align-items: center; justify-content: center; 
                  background: #f0f0f0; border-radius: 12px; color: #333; font-size: 0.8rem; text-align: center; padding: 1rem;">
        <div>
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">📱</div>
          QR Code<br/>
          <a href="${arUrl}" style="color: #8b5cf6; word-break: break-all; font-size: 0.7rem;">${arUrl}</a>
        </div>
      </div>
    `;
    return;
  }

  // Create canvas element
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  QRCode.toCanvas(canvas, arUrl, {
    width: 200,
    margin: 2,
    color: {
      dark: '#1a1a2e',
      light: '#ffffff'
    },
    errorCorrectionLevel: 'M'
  }, (error) => {
    if (error) {
      console.error('QR code generation failed:', error);
      container.innerHTML = `
        <div style="width: 200px; height: 200px; display: flex; align-items: center; justify-content: center; 
                    background: #f0f0f0; border-radius: 12px; color: #333; font-size: 0.8rem; text-align: center; padding: 1rem;">
          <div>
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📱</div>
            Open on mobile:<br/>
            <a href="${arUrl}" style="color: #8b5cf6; word-break: break-all; font-size: 0.7rem;">${arUrl}</a>
          </div>
        </div>
      `;
    }
  });
}
