'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Skill } from '@/lib/types';
import { fetchNextLesson } from '@/lib/api';

interface Props { skill: Skill; hearts: number; onClose: () => void }

export default function SkillPopup({ skill, hearts, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const prog = skill.progress;

  const status = !prog || !prog.is_unlocked
    ? 'locked'
    : prog.crown_level >= 1
      ? 'completed'
      : prog.lessons_completed > 0
        ? 'in-progress'
        : 'available';

  const handleStart = async () => {
    if (hearts <= 0) return;
    setLoading(true);
    try {
      const lesson = await fetchNextLesson(skill.id);
      router.push(`/lesson/${lesson.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="skill-popup-overlay" onClick={onClose}>
      <div className="skill-popup" onClick={e => e.stopPropagation()}>
        <div className="skill-popup-header">
          <div className="skill-popup-icon">{skill.icon_name}</div>
          <div className="skill-popup-title">{skill.title}</div>
          <div className="skill-popup-meta">
            {prog ? `${prog.lessons_completed}/${prog.total_lessons} lessons` : '0/3 lessons'}
            {prog && prog.crown_level >= 1 && ' · 👑 Crowned'}
          </div>
        </div>
        {prog && (
          <div style={{ marginBottom: 20 }}>
            <div className="xp-bar-track">
              <div className="xp-bar-fill" style={{ width: `${Math.min(100, ((prog.lessons_completed / prog.total_lessons) * 100))}%` }} />
            </div>
          </div>
        )}
        <button
          className={`btn ${status === 'locked' || hearts <= 0 ? 'btn-gray' : 'btn-green'}`}
          style={{ width: '100%' }}
          onClick={status !== 'locked' && hearts > 0 ? handleStart : undefined}
          disabled={status === 'locked' || hearts <= 0 || loading}
        >
          {loading ? '...' : hearts <= 0 ? '💔 Out of Hearts' : status === 'locked' ? '🔒 Locked' : status === 'completed' ? '⭐ Practice' : '▶ Start'}
        </button>
        {hearts <= 0 && status !== 'locked' && (
          <p style={{ marginTop: 10, fontSize: 13, color: '#AFAFAF', textAlign: 'center', fontWeight: 600 }}>
            Hearts regenerate every 4 hours, or refill in the Shop.
          </p>
        )}
        <button
          onClick={onClose}
          style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: '#AFAFAF', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
