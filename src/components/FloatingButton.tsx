import { Dog } from 'lucide-react';
import { useEffect, useState } from 'react';

export function FloatingButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setIsVisible(window.scrollY > 200);
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initialize on mount
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type='button'
      aria-label='스크롤 상단으로'
      onClick={scrollToTop}
      className={`bg-primary absolute right-6 bottom-6 z-50 inline-flex size-fit items-center justify-center rounded-full p-2 shadow-lg transition-opacity duration-300 ${
        isVisible ? 'opacity-50' : 'pointer-events-none opacity-100'
      }`}
    >
      <Dog className='size-6 text-white' />
    </button>
  );
}

export default FloatingButton;
