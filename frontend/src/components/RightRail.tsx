'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { User } from '@/lib/types';

interface Props { user: User | null }

const QUESTS = [
  { id: 'xp', icon: '⚡', name: 'Earn XP', reward: 5, getPct: (u: User | null) =>
    u ? Math.min(100, (u.daily_xp_earned / u.daily_xp_goal) * 100) : 0 },
  { id: 'lesson', icon: '📖', name: 'Complete 1 lesson', reward: 10, getPct: (u: User | null) =>
    u && u.daily_xp_earned >= 10 ? 100 : 0 },
  { id: 'perfect', icon: '🎯', name: 'Perfect lesson', reward: 20, getPct: () => 0 },
];

export default function RightRail({ user }: Props) {
  const path = usePathname();
  if (path.startsWith('/lesson')) return null;

  return (
    <aside className="right-rail">
      <div className="rail-card league-card">
        <div className="league-card-top">
          <span className="league-medal">🥉</span>
          <div>
            <p className="league-label">Bronze League</p>
            <p className="league-sub">Top 10 advance · Bottom 5 demote</p>
          </div>
        </div>
        <div className="league-podium" aria-hidden>
          <div className="podium-bar podium-2"><span>2</span></div>
          <div className="podium-bar podium-1"><span>1</span></div>
          <div className="podium-bar podium-3"><span>3</span></div>
        </div>
        <Link href="/leaderboard" className="btn btn-outline league-btn">
          View Leaderboard
        </Link>
      </div>

      <div className="rail-card quests-card">
        <div className="quests-card-header">
          <h3 className="rail-title">Daily Quests</h3>
          <span className="quests-reset">Resets daily</span>
        </div>
        {QUESTS.map(q => {
          const pct = q.getPct(user);
          const done = pct >= 100;
          return (
            <div key={q.id} className={`quest-row ${done ? 'quest-row--done' : ''}`}>
              <span className="quest-icon-box">{done ? '✓' : q.icon}</span>
              <div className="quest-info">
                <p className="quest-name">{q.name}</p>
                <div className="xp-bar-track quest-bar">
                  <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
              <span className="quest-reward-pill">💎 {q.reward}</span>
            </div>
          );
        })}
      </div>

      <div className="rail-card super-card">
        <div className="super-badge">SUPER</div>
        <h3 className="super-title">Try Super for free</h3>
        <p className="super-desc">No ads, unlimited hearts, and personalized practice.</p>
        <button className="btn btn-blue super-btn" type="button">Try 2 weeks free</button>
      </div>
    </aside>
  );
}
