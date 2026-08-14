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
    <div className="loading-state">
      <p>Loading profile...</p>
    </div>
  );

  const earned = achievements.filter(a => a.earned);
  const xpPct = Math.min(100, (user.daily_xp_earned / user.daily_xp_goal) * 100);

  return (
    <div className="page-content">
      <div className="profile-card" style={{ textAlign: 'center' }}>
        <div className="profile-avatar">🦜</div>
        <h1 style={{ fontSize: 26, fontWeight: 900 }}>{user.display_name}</h1>
        <p style={{ color: 'var(--duo-gray2)', fontWeight: 600, fontSize: 14 }}>@{user.username}</p>
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--duo-gray2)', marginBottom: 8, fontWeight: 700 }}>
            Daily Goal: {user.daily_xp_earned}/{user.daily_xp_goal} XP
          </p>
          <div className="xp-bar-track"><div className="xp-bar-fill" style={{ width: `${xpPct}%` }} /></div>
        </div>
      </div>

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

      <div className="section-title">Hearts</div>
      <div className="profile-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 44 }}>❤️</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 800, fontSize: 18 }}>{user.hearts}/{user.max_hearts} Hearts</p>
          <p style={{ color: 'var(--duo-gray2)', fontSize: 13, fontWeight: 600 }}>Hearts regenerate 1 every 4 hours</p>
        </div>
      </div>

      <div className="section-title">Achievements ({earned.length}/{achievements.length})</div>
      <div className="achievement-grid">
        {achievements.map(a => (
          <div key={a.id} className={`achievement-card ${a.earned ? 'earned' : 'locked'}`}>
            <div className="achievement-icon">{a.icon_name}</div>
            <div className="achievement-name">{a.name}</div>
            <div className="achievement-desc">{a.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
