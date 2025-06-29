import { motion } from 'framer-motion';
import { useEffect, useRef, useState, useMemo } from 'react';

interface BlurTextProps {
  text?: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'characters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  onAnimationComplete?: () => void;
  stepDuration?: number;
}

const BlurText = ({
  text = '',
  delay = 100,
  className = '',
  animateBy = 'words',
  direction = 'bottom',
  threshold = 0.1,
  rootMargin = '0px',
  onAnimationComplete,
  stepDuration = 0.35,
}: BlurTextProps) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current!);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const initialState = useMemo(
    () => ({
      filter: 'blur(10px)',
      opacity: 0,
      y: direction === 'top' ? -50 : 50,
    }),
    [direction]
  );

  const animateState = useMemo(
    () => ({
      filter: 'blur(0px)',
      opacity: 1,
      y: 0,
    }),
    []
  );

  return (
    <p
      ref={ref}
      className={`blur-text ${className} flex flex-wrap`}
    >
      {elements.map((segment, index) => (
        <motion.span
          className="inline-block will-change-[transform,filter,opacity]"
          key={index}
          initial={initialState}
          animate={inView ? animateState : initialState}
          transition={{
            duration: stepDuration,
            delay: (index * delay) / 1000,
            ease: "easeOut"
          }}
          onAnimationComplete={
            index === elements.length - 1 ? onAnimationComplete : undefined
          }
        >
          {segment === ' ' ? '\u00A0' : segment}
          {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
        </motion.span>
      ))}
    </p>
  );
};

export default BlurText; 