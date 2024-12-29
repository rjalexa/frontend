// components/statistics/AnimatedCounter.tsx
import React, { useEffect, useState, useRef } from 'react';

interface IAnimatedCounterProps {
  value: number;
}

const AnimatedCounter = ({ value }: IAnimatedCounterProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || typeof value !== 'number') return;
    
    const duration = 2000;
    startTimeRef.current = undefined;
    
    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }
      
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth deceleration
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const currentValue = Math.floor(value * easeOutQuart);
      
      if (progress < 1) {
        // Calculate maximum noise based on value's magnitude
        const valueStr = value.toString();
        const magnitude = Math.min(valueStr.length - 2, 3);
        const maxNoise = Math.pow(10, magnitude) - 1;
        const randomNoise = Math.floor(Math.random() * maxNoise);
        
        const combinedValue = currentValue + randomNoise;
        if (combinedValue.toString().length <= valueStr.length) {
          setDisplayValue(combinedValue);
        } else {
          setDisplayValue(currentValue);
        }
        
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, isMounted]);
  
  // Safe render for SSR and non-number values
  if (!isMounted || typeof value !== 'number') {
    return <>{value?.toLocaleString?.() || ''}</>;
  }
  
  return <>{displayValue.toLocaleString()}</>;
};

export default AnimatedCounter;