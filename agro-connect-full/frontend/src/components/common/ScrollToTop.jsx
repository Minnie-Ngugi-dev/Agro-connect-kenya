import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const fn = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  if (!visible) return null;
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Scroll to top"
      className="fixed bottom-6 right-6 z-50 w-11 h-11 bg-forest-600 hover:bg-forest-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95">
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
