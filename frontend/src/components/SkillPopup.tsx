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

  const progressPct = prog
    ? Math.min(100, (prog.lessons_completed / prog.total_lessons) * 100)
    : 0;

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

  const statusLabels = {
    locked: 'Locked',
    completed: 'Practice',
    'in-progress': 'Continue',
    available: 'Start',
  };

  return (
    <div className="skill-popup-overlay" onClick={onClose}>
      <div className="skill-popup" onClick={e => e.stopPropagation()}>
        <div className="skill-popup-pointer" aria-hidden />
        <div className="skill-popup-header">
          <div className="skill-popup-icon">{skill.icon_name}</div>
          <div className="skill-popup-title">{skill.title}</div>
          <div className="skill-popup-meta">
            {prog ? `${prog.lessons_completed}/${prog.total_lessons} lessons` : '0/3 lessons'}
            {prog && prog.crown_level >= 1 && ' · 👑 Crowned'}
          </div>
        </div>

        {prog && (
          <div className="skill-popup-progress">
            <div className="xp-bar-track">
              <div className="xp-bar-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}

        <button
          type="button"
          className={`btn btn-lg ${status === 'locked' || hearts <= 0 ? 'btn-gray' : 'btn-green'}`}
          onClick={status !== 'locked' && hearts > 0 ? handleStart : undefined}
          disabled={status === 'locked' || hearts <= 0 || loading}
        >
          {loading ? 'Loading...' : hearts <= 0 ? 'Out of Hearts' : statusLabels[status]}
        </button>

        {hearts <= 0 && status !== 'locked' && (
          <p className="skill-popup-hint">Hearts regenerate every 4 hours, or refill in the Shop.</p>
        )}

        <button type="button" className="skill-popup-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
