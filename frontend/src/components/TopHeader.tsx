'use client';
import { usePathname } from 'next/navigation';
import type { User } from '@/lib/types';
import { IconStreak, IconHeart, IconGem } from './icons';
import { motion, useReducedMotion } from 'framer-motion';

// Workaround: framer-motion types can conflict with React 19 in some CI builds.
// Create a loose-typed alias so `className` and standard HTML props are allowed.
const MotionDiv: any = motion.div as any;

interface Props { user: User | null }

export default function TopHeader({ user }: Props) {
  const path = usePathname();
  const reduceMotion = useReducedMotion();
  if (path.startsWith('/lesson')) return null;

  const xpPct = user
    ? Math.min(100, (user.daily_xp_earned / user.daily_xp_goal) * 100)
    : 0;

  return (
    <header className="top-header">
      <div className="top-header-course">
        <MotionDiv
          className="mascot"
          role="img"
          aria-label="Friendly bird mascot"
          initial={reduceMotion ? undefined : { y: -8, opacity: 0 }}
          animate={reduceMotion ? undefined : { y: 0, opacity: 1 }}
          transition={reduceMotion ? undefined : { type: 'spring', stiffness: 120, damping: 12 }}
          whileHover={reduceMotion ? undefined : { scale: 1.06, rotate: [0, -8, 8, 0] }}
        >
          <svg width="44" height="44" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <g fill="none" fillRule="evenodd">
              <circle cx="32" cy="32" r="30" fill="#34D399" />
              <path d="M20 40c4-8 16-10 22-6 4 2 8 8 6 12-6 2-16 2-28-6z" fill="#fff" />
              <circle cx="34" cy="28" r="6" fill="#0f172a" />
            </g>
          </svg>
        </MotionDiv>
        <span className="course-flag" aria-hidden>🇪🇸</span>
        <span className="course-name">Spanish</span>
      </div>
      <div className="top-header-stats">
        <div className="header-stat streak" title="Day streak">
          <IconStreak />
          <span>{user?.current_streak ?? 0}</span>
        </div>
        <div className="header-stat xp" title="Daily XP goal">
          <div className="header-xp-row">
            <span className="header-xp-icon">⚡</span>
            <span>{user?.daily_xp_earned ?? 0}/{user?.daily_xp_goal ?? 20}</span>
          </div>
          <div className="header-xp-bar">
              {reduceMotion ? (
              <div className="header-xp-fill" style={{ width: `${xpPct}%` }} />
            ) : (
              <MotionDiv
                className="header-xp-fill"
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ type: 'spring', stiffness: 80, damping: 14 }}
              />
            )}
          </div>
        </div>
        <div className="header-stat gems" title="Gems">
          <IconGem />
          <span>{user?.gems ?? 0}</span>
        </div>
        <div className="header-stat hearts" title="Hearts">
          <IconHeart />
          <span>{user?.hearts ?? 0}</span>
        </div>
      </div>
    </header>
  );
}
