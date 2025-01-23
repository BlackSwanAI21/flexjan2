import React, { useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiProps {
  isActive: boolean;
}

export function Confetti({ isActive }: ConfettiProps) {
  const fire = useCallback(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#818CF8', '#6366F1', '#4F46E5', '#4338CA', '#3730A3'],
      startVelocity: 30,
      gravity: 0.8,
      scalar: 0.9,
      ticks: 100
    });
  }, []);

  useEffect(() => {
    if (isActive) {
      fire();
    }
  }, [isActive, fire]);

  return null;
} 