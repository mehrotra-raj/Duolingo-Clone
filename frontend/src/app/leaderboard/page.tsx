'use client';
import { useEffect, useState } from 'react';
import { fetchLeaderboard } from '@/lib/api';
import type { Leaderboard } from '@/lib/types';

const LEAGUE_EMOJI: Record<string, string> = {
  Bronze: '🥉', Silver: '🥈', Gold: '🥇', Diamond: '💎', Obsidian: '⚫',
};

export default function LeaderboardPage() {
  const [data, setData] = useState<Leaderboard | null>(null);

  useEffect(() => { fetchLeaderboard().then(setData); }, []);

  if (!data) return (
    <div className="loading-state">
      <p>Loading leaderboard...</p>
    </div>
  );

  const top3Colors = ['var(--duo-gold)', '#C0C0C0', '#CD7F32'];

  return (
    <div className="page-content">
      <h1 className="page-title">Leaderboard</h1>
      <div className="league-badge">
        {LEAGUE_EMOJI[data.league] ?? '🏆'} {data.league} League
      </div>

      <div className="league-info-bar">
        <span>🔼 Top 10 promote</span>
        <span>🔽 Bottom 5 demote</span>
      </div>

      {data.entries.map((entry, i) => (
        <div
          key={entry.user_id}
          className={`leaderboard-entry ${entry.is_current_user ? 'current' : ''}`}
          style={{ borderLeft: i < 3 ? `4px solid ${top3Colors[i]}` : undefined }}
        >
          <div className="leaderboard-rank" style={{ color: i < 3 ? top3Colors[i] : undefined, fontSize: i < 3 ? 22 : 16 }}>
            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : entry.rank}
          </div>
          <div className="leaderboard-avatar">🦜</div>
          <div className="leaderboard-name">
            {entry.display_name}
            {entry.is_current_user && (
              <span style={{ fontSize: 11, color: 'var(--duo-blue)', marginLeft: 8, fontWeight: 800 }}>YOU</span>
            )}
          </div>
          <div className="leaderboard-xp">⭐ {entry.weekly_xp} XP</div>
        </div>
      ))}

      {data.current_user_rank > 0 && (
        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--duo-gray2)', fontWeight: 700, fontSize: 14 }}>
          Your rank: #{data.current_user_rank}
        </p>
      )}
    </div>
  );
}
