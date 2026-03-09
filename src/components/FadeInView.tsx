"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface FadeInViewProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeInView({ children, className = "", delay = 0 }: FadeInViewProps) {
  // Start as "will animate" only after we confirm the element is out of viewport.
  // Initialize to true so SSR and the first paint are always visible.
  const [isVisible, setIsVisible] = useState(true);
  const [animating, setAnimating] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true);
            setAnimating(false);
          }, delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    // Only hide and animate if the element is NOT already in the viewport.
    const rect = el.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inViewport) {
      setIsVisible(false);
      setAnimating(true);
    }

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${
        animating && !isVisible ? "opacity-0 translate-y-5" : "opacity-100 translate-y-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}
