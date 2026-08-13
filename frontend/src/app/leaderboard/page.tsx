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
    <div className="page-content" style={{ paddingTop: 80, textAlign: 'center', color: '#AFAFAF' }}>
      Loading leaderboard...
    </div>
  );

  const top3Colors = ['var(--duo-gold)', '#C0C0C0', '#CD7F32'];

  return (
    <div className="page-content">
      <h1 className="page-title">Leaderboard</h1>
      <div className="league-badge">
        {LEAGUE_EMOJI[data.league] ?? '🏆'} {data.league} League
      </div>

      <div style={{ background: '#fff', border: '2px solid var(--duo-gray)', borderRadius: 16, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#AFAFAF', fontWeight: 700 }}>
        <span>🔼 Top 10 promote</span>
        <span>🔽 Bottom 5 demote</span>
      </div>

      {data.entries.map((entry, i) => (
        <div key={entry.user_id} className={`leaderboard-entry ${entry.is_current_user ? 'current' : ''}`}
          style={{ borderLeft: i < 3 ? `4px solid ${top3Colors[i]}` : undefined }}>
          <div className="leaderboard-rank" style={{ color: i < 3 ? top3Colors[i] : undefined, fontSize: i < 3 ? 20 : 16 }}>
            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : entry.rank}
          </div>
          <div className="leaderboard-avatar">🦜</div>
          <div className="leaderboard-name">
            {entry.display_name}
            {entry.is_current_user && <span style={{ fontSize: 11, color: 'var(--duo-blue)', marginLeft: 6 }}>YOU</span>}
          </div>
          <div className="leaderboard-xp">⭐ {entry.weekly_xp} XP</div>
        </div>
      ))}

      {data.current_user_rank > 0 && (
        <p style={{ textAlign: 'center', marginTop: 16, color: '#AFAFAF', fontWeight: 700, fontSize: 14 }}>
          Your rank: #{data.current_user_rank}
        </p>
      )}
    </div>
  );
}
