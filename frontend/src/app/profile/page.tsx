'use client';
import { useEffect, useState } from 'react';
import { fetchUser, fetchAchievements } from '@/lib/api';
import type { User, Achievement } from '@/lib/types';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    fetchUser().then(setUser);
    fetchAchievements().then(setAchievements);
  }, []);

  if (!user) return (
    <div className="page-content" style={{ paddingTop: 80, textAlign: 'center', color: '#AFAFAF' }}>
      Loading profile...
    </div>
  );

  const earned = achievements.filter(a => a.earned);
  const xpPct = Math.min(100, (user.daily_xp_earned / user.daily_xp_goal) * 100);

  return (
    <div className="page-content">
      {/* Header */}
      <div className="profile-card" style={{ textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--duo-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, margin: '0 auto 16px' }}>
          🦜
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 900 }}>{user.display_name}</h1>
        <p style={{ color: '#AFAFAF', fontWeight: 600, fontSize: 14 }}>@{user.username}</p>
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 13, color: '#AFAFAF', marginBottom: 6 }}>Daily Goal: {user.daily_xp_earned}/{user.daily_xp_goal} XP</p>
          <div className="xp-bar-track"><div className="xp-bar-fill" style={{ width: `${xpPct}%` }} /></div>
        </div>
      </div>

      {/* Stats */}
      <div className="section-title">Statistics</div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-val" style={{ color: 'var(--duo-gold)' }}>⭐ {user.total_xp}</div>
          <div className="stat-card-lbl">Total XP</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-val" style={{ color: 'var(--duo-orange)' }}>🔥 {user.current_streak}</div>
          <div className="stat-card-lbl">Current Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-val" style={{ color: 'var(--duo-purple)' }}>🏆 {user.longest_streak}</div>
          <div className="stat-card-lbl">Longest Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-val" style={{ color: 'var(--duo-blue)' }}>💎 {user.gems}</div>
          <div className="stat-card-lbl">Gems</div>
        </div>
      </div>

      {/* Hearts */}
      <div className="section-title">Hearts</div>
      <div className="profile-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 40 }}>❤️</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 800, fontSize: 18 }}>{user.hearts}/{user.max_hearts} Hearts</p>
          <p style={{ color: '#AFAFAF', fontSize: 13 }}>Hearts regenerate 1 every 4 hours</p>
        </div>
      </div>

      {/* Achievements */}
      <div className="section-title">Achievements ({earned.length}/{achievements.length})</div>
      <div className="achievement-grid">
        {achievements.map(a => (
          <div key={a.id} className={`achievement-card ${a.earned ? 'earned' : 'locked'}`}>
            <div className="achievement-icon">{a.icon_name}</div>
            <div className="achievement-name">{a.name}</div>
            <div style={{ fontSize: 11, color: '#AFAFAF', marginTop: 4 }}>{a.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
