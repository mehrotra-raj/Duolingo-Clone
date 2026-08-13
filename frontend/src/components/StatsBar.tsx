'use client';
import type { User } from '@/lib/types';

interface Props { user: User | null }

export default function StatsBar({ user }: Props) {
  if (!user) return null;
  const xpPct = Math.min(100, (user.daily_xp_earned / user.daily_xp_goal) * 100);
  return (
    <div className="stats-bar">
      <span className="stat-chip streak">
        <span className="icon">🔥</span>{user.current_streak}
      </span>
      <span className="stat-chip hearts">
        <span className="icon">❤️</span>{user.hearts}
      </span>
      <span className="stat-chip gems">
        <span className="icon">💎</span>{user.gems}
      </span>
      <span className="stat-chip xp" style={{ marginLeft: 'auto', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
        <span style={{ fontSize: 13 }}>⭐ {user.daily_xp_earned}/{user.daily_xp_goal} XP</span>
        <div className="xp-bar-track" style={{ width: 100 }}>
          <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
        </div>
      </span>
    </div>
  );
}
