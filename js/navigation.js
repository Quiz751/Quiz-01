import { isScrolled, isMobileMenuOpen, setIsScrolled, setIsMobileMenuOpen } from './state.js';
import { navigateTo } from './router.js';

export function initNavigation() {
  window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    const scrolled = window.scrollY > 16;
    if (scrolled !== isScrolled) {
      setIsScrolled(scrolled);
      if (scrolled) header.classList.add('header--scrolled');
      else header.classList.remove('header--scrolled');
    }
  });

  const mobileToggle = document.getElementById('mobileToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  mobileToggle.addEventListener('click', () => {
    const open = !isMobileMenuOpen;
    setIsMobileMenuOpen(open);
    if (open) {
      mobileMenu.style.display = 'block';
      setTimeout(() => mobileMenu.classList.add('show'), 10);
      mobileToggle.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    } else {
      mobileMenu.classList.remove('show');
      setTimeout(() => mobileMenu.style.display = 'none', 300);
      mobileToggle.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
    }
  });

  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-route]');
    if (target) {
      e.preventDefault();
      const route = target.getAttribute('data-route');
      navigateTo(route);
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        mobileMenu.classList.remove('show');
        setTimeout(() => mobileMenu.style.display = 'none', 300);
        mobileToggle.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
      }
    }
  });
}

