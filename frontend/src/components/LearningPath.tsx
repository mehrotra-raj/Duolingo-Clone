'use client';
import { useState } from 'react';
import type { Unit, Skill } from '@/lib/types';
import SkillPopup from './SkillPopup';

const POSITIONS = ['pos-left', 'pos-center', 'pos-right', 'pos-center'];

function SkillNode({ skill, index, onClick }: { skill: Skill; index: number; onClick: () => void }) {
  const prog = skill.progress;
  const status = !prog || !prog.is_unlocked
    ? 'locked'
    : prog.crown_level >= 1
      ? 'completed'
      : prog.lessons_completed > 0
        ? 'in-progress'
        : 'available';

  return (
    <div className={`skill-row ${POSITIONS[index % 4]}`}>
      <div className="skill-node-wrapper" style={{ marginBottom: 28 }}>
        {status === 'completed' && <span className="skill-crown">👑</span>}
        <div className={`skill-node ${status}`} onClick={status !== 'locked' ? onClick : undefined} title={skill.title}>
          {status === 'locked' ? '🔒' : skill.icon_name}
        </div>
        <span className="skill-label">{skill.title}</span>
      </div>
    </div>
  );
}

interface Props { units: Unit[]; hearts: number }

export default function LearningPath({ units, hearts }: Props) {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  return (
    <div className="path-wrapper">
      {units.map(unit => (
        <div key={unit.id}>
          <div className="unit-header" style={{ background: unit.color }}>
            <div>
              <h2>Unit {unit.order_index + 1}: {unit.title}</h2>
              <p>{unit.description}</p>
            </div>
            <button className="unit-guidebook-btn">📖 Guidebook</button>
          </div>
          <div className="skills-path">
            {unit.skills.map((skill, idx) => (
              <SkillNode
                key={skill.id}
                skill={skill}
                index={idx}
                onClick={() => setSelectedSkill(skill)}
              />
            ))}
          </div>
        </div>
      ))}
      {selectedSkill && (
        <SkillPopup skill={selectedSkill} hearts={hearts} onClose={() => setSelectedSkill(null)} />
      )}
    </div>
  );
}
