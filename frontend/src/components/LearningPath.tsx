'use client';
import { useMemo, useState } from 'react';
import type { Unit, Skill } from '@/lib/types';
import SkillPopup from './SkillPopup';
import { DuoLogo, IconCheck, IconLock } from './icons';

/** Zigzag x-positions (% from left) — classic Duolingo winding path */
const PATH_X = [50, 24, 50, 76, 50, 24, 50, 76, 50];
const NODE_STEP = 118;

type SkillStatus = 'locked' | 'completed' | 'current' | 'available';

function getCurrentSkillIndex(skills: Skill[]): number {
  for (let i = 0; i < skills.length; i++) {
    const p = skills[i].progress;
    if (p?.is_unlocked && p.lessons_completed < skills[i].total_lessons) {
      return i;
    }
  }
  return -1;
}

function getSkillStatus(skill: Skill, isCurrent: boolean): SkillStatus {
  const prog = skill.progress;
  if (!prog || !prog.is_unlocked) return 'locked';
  if (prog.crown_level >= 1 || prog.lessons_completed >= skill.total_lessons) return 'completed';
  if (isCurrent || prog.lessons_completed > 0) return 'current';
  return 'available';
}

function buildTrailPath(positions: number[], count: number): string {
  if (count < 2) return '';
  const step = 100 / Math.max(count - 1, 1);
  const pts = Array.from({ length: count }, (_, i) => ({
    x: positions[i % positions.length],
    y: 8 + i * step,
  }));

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const midY = (prev.y + curr.y) / 2;
    d += ` C ${prev.x} ${midY}, ${curr.x} ${midY}, ${curr.x} ${curr.y}`;
  }
  return d;
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, pct) / 100);
  return (
    <svg className="skill-progress-ring" viewBox="0 0 92 92" aria-hidden>
      <circle cx="46" cy="46" r={r} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="7" />
      <circle
        cx="46"
        cy="46"
        r={r}
        fill="none"
        stroke="#7ADB2E"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 46 46)"
      />
    </svg>
  );
}

function SkillNode({
  skill,
  status,
  xPct,
  topPx,
  onClick,
}: {
  skill: Skill;
  status: SkillStatus;
  xPct: number;
  topPx: number;
  onClick: () => void;
}) {
  const prog = skill.progress;
  const progressPct = prog
    ? Math.min(100, (prog.lessons_completed / skill.total_lessons) * 100)
    : 0;

  return (
    <div
      className="skill-node-slot"
      style={{ left: `${xPct}%`, top: topPx }}
    >
      {status === 'current' && (
        <>
          <span className="skill-start-ring" aria-hidden />
          <span className="skill-start-label">START</span>
          <div className={`path-duo-bubble${xPct > 62 ? ' path-duo-left' : ''}`} aria-hidden>
            <DuoLogo size={40} />
          </div>
        </>
      )}
      {status === 'completed' && (
        <span className="skill-crown" aria-hidden>👑</span>
      )}

      {(status === 'current' || (status === 'available' && progressPct > 0)) && (
        <ProgressRing pct={progressPct} />
      )}

      <button
        type="button"
        className={`skill-node ${status}`}
        onClick={status !== 'locked' ? onClick : undefined}
        disabled={status === 'locked'}
        aria-label={skill.title}
      >
        <span className="skill-node-inner">
          {status === 'locked' ? (
            <IconLock />
          ) : status === 'completed' ? (
            <IconCheck />
          ) : (
            skill.icon_name
          )}
        </span>
      </button>

      <span className="skill-node-label">{skill.title}</span>
    </div>
  );
}

function UnitPath({
  unit,
  onSkillClick,
}: {
  unit: Unit;
  onSkillClick: (skill: Skill) => void;
}) {
  const currentIdx = useMemo(() => getCurrentSkillIndex(unit.skills), [unit.skills]);
  const trailD = useMemo(
    () => buildTrailPath(PATH_X, unit.skills.length),
    [unit.skills.length],
  );
  const pathHeight = unit.skills.length * NODE_STEP + 40;

  return (
    <section className="unit-section">
      <div className="unit-header" style={{ '--unit-color': unit.color } as React.CSSProperties}>
        <div className="unit-header-badge">SECTION {unit.order_index + 1}</div>
        <div className="unit-header-body">
          <div className="unit-header-content">
            <h2>{unit.title}</h2>
            <p>{unit.description}</p>
          </div>
          <button type="button" className="unit-guidebook-btn">
            <span aria-hidden>📖</span>
            <span>Guidebook</span>
          </button>
        </div>
      </div>

      <div
        className="skills-path-track"
        style={{ height: pathHeight }}
      >
        {unit.skills.length > 1 && (
          <svg
            className="path-trail-svg"
            viewBox={`0 0 100 ${Math.max(16, (unit.skills.length - 1) * (100 / Math.max(unit.skills.length - 1, 1)) + 16)}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            <path className="path-trail-shadow" d={trailD} />
            <path className="path-trail-line" d={trailD} />
          </svg>
        )}

        {unit.skills.map((skill, idx) => (
          <SkillNode
            key={skill.id}
            skill={skill}
            status={getSkillStatus(skill, idx === currentIdx)}
            xPct={PATH_X[idx % PATH_X.length]}
            topPx={idx * NODE_STEP}
            onClick={() => onSkillClick(skill)}
          />
        ))}
      </div>
    </section>
  );
}

interface Props { units: Unit[]; hearts: number }

export default function LearningPath({ units, hearts }: Props) {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  return (
    <div className="path-scene">
      <div className="path-sky-gradient" aria-hidden />
      <div className="path-cloud path-cloud-1" aria-hidden />
      <div className="path-cloud path-cloud-2" aria-hidden />
      <div className="path-cloud path-cloud-3" aria-hidden />
      <div className="path-cloud path-cloud-4" aria-hidden />
      <div className="path-hill path-hill-back" aria-hidden />
      <div className="path-hill path-hill-front" aria-hidden />

      <div className="path-wrapper">
        {units.map(unit => (
          <UnitPath key={unit.id} unit={unit} onSkillClick={setSelectedSkill} />
        ))}
        <div className="path-end-marker" aria-hidden>
          <span>🗺️</span>
          <p>More coming soon</p>
        </div>
      </div>

      {selectedSkill && (
        <SkillPopup
          skill={selectedSkill}
          hearts={hearts}
          onClose={() => setSelectedSkill(null)}
        />
      )}
    </div>
  );
}
