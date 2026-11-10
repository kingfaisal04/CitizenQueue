/**
 * CitizenQueue - Automatic Scroll Restoration Component
 * 
 * Ensures that whenever any page is opened or navigated to,
 * the viewport automatically and reliably opens from the top (0, 0).
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If a hash anchor is provided (e.g., #faq), allow scrolling to that section
    if (hash) {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Automatically scroll to top of window immediately on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Secondary tick to ensure scroll stays at top after layout renders
    const rafId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname, hash]);

  return null;
}
