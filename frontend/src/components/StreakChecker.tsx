'use client';
import { useEffect } from 'react';
import { checkStreak } from '@/lib/api';

/** Runs streak check once on app load (backend resets streak if day was missed). */
export default function StreakChecker() {
  useEffect(() => {
    checkStreak().catch(() => {});
  }, []);
  return null;
}
