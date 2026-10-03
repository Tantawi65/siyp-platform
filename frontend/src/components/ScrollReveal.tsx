import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'scale' | 'zoom-in';
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({ 
  children, 
  animation = 'fade-up', 
  delay = 0,
  duration = 700,
  threshold = 0.1,
  className = '',
  style = {}
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(currentRef);
        }
      },
      { threshold }
    );
    
    observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [threshold]);

  const getTransform = () => {
    if (isVisible) return 'translate(0, 0) scale(1)';
    switch (animation) {
      case 'fade-up': return 'translateY(40px)';
      case 'fade-left': return 'translateX(40px)';
      case 'fade-right': return 'translateX(-40px)';
      case 'scale': return 'scale(0.95)';
      case 'zoom-in': return 'scale(0.85) translateY(20px)';
      default: return 'translateY(40px)';
    }
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms ease-out, transform ${duration}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
