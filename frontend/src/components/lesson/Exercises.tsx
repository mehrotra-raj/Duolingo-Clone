'use client';
import { useState } from 'react';
import type { Exercise } from '@/lib/types';
import { checkAnswer, deductHeart } from '@/lib/api';

type AnswerHandler = (
  correct: boolean,
  correctAnswer: string,
  heartsRemaining: number,
) => void;

/* ── Multiple Choice ─────────────────────────────────────────────── */
export function MultipleChoice({
  exercise, onAnswer, disabled,
}: { exercise: Exercise; onAnswer: AnswerHandler; disabled: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<null | { correct: boolean; correct_answer: string }>(null);

  const handleSelect = async (opt: string) => {
    if (disabled || result) return;
    setSelected(opt);
    const res = await checkAnswer(exercise.id, opt);
    setResult(res);
    onAnswer(res.correct, res.correct_answer, res.hearts_remaining);
  };

  return (
    <div className="mc-options">
      {(exercise.options ?? []).map((opt, i) => {
        let cls = 'mc-option';
        if (result) {
          if (opt === result.correct_answer) cls += ' correct disabled';
          else if (opt === selected && !result.correct) cls += ' wrong disabled';
          else cls += ' disabled';
        } else if (opt === selected) cls += ' selected';
        return (
          <button key={i} type="button" className={cls} onClick={() => handleSelect(opt)}>
            <span className="mc-option-letter">{String.fromCharCode(65 + i)}</span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ── Word Bank ───────────────────────────────────────────────────── */
export function WordBank({
  exercise, onAnswer, disabled,
}: { exercise: Exercise; onAnswer: AnswerHandler; disabled: boolean }) {
  const [answer, setAnswer] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const pool = exercise.word_bank ?? [];
  const toggle = (word: string, inAnswer: boolean) => {
    if (submitted || disabled) return;
    if (inAnswer) setAnswer(a => a.filter(w => w !== word));
    else setAnswer(a => [...a, word]);
  };

  const handleCheck = async () => {
    if (!answer.length) return;
    const res = await checkAnswer(exercise.id, answer.join(' '));
    setSubmitted(true);
    onAnswer(res.correct, res.correct_answer, res.hearts_remaining);
  };

  return (
    <>
      <div className="word-bank-answer">
        {answer.map((w, i) => (
          <button key={i} className="word-chip answer-chip" onClick={() => toggle(w, true)}>{w}</button>
        ))}
      </div>
      <div className="word-bank-pool">
        {pool.map((w, i) => (
          <button key={i} className={`word-chip ${answer.includes(w) ? 'selected' : ''}`}
            onClick={() => toggle(w, false)} disabled={answer.includes(w) || submitted}>
            {w}
          </button>
        ))}
      </div>
      {!submitted && !disabled && (
        <button className="btn btn-green" style={{ marginTop: 24 }} onClick={handleCheck} disabled={!answer.length}>
          Check
        </button>
      )}
    </>
  );
}

/* ── Fill Blank ──────────────────────────────────────────────────── */
export function FillBlank({
  exercise, onAnswer, disabled,
}: { exercise: Exercise; onAnswer: AnswerHandler; disabled: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<null | { correct: boolean; correct_answer: string }>(null);
  const sentence = exercise.sentence_with_blank ?? '_____ ?';

  const handleSelect = async (opt: string) => {
    if (disabled || result) return;
    setSelected(opt);
    const res = await checkAnswer(exercise.id, opt);
    setResult(res);
    onAnswer(res.correct, res.correct_answer, res.hearts_remaining);
  };

  const filled = sentence.replace('_____', selected ? `[${selected}]` : '_____');

  return (
    <>
      <div className="fill-sentence">
        {filled.split(/(\[[^\]]+\])/g).map((part, i) =>
          part.startsWith('[') ? (
            <span key={i} className="fill-blank-slot">{part.slice(1, -1)}</span>
          ) : part
        )}
      </div>
      <div className="mc-options">
        {(exercise.options ?? []).map((opt, i) => {
          let cls = 'mc-option';
          if (result) {
            if (opt === result.correct_answer) cls += ' correct disabled';
            else if (opt === selected && !result.correct) cls += ' wrong disabled';
            else cls += ' disabled';
          } else if (opt === selected) cls += ' selected';
          return <button key={i} className={cls} onClick={() => handleSelect(opt)}>{opt}</button>;
        })}
      </div>
    </>
  );
}

/* ── Type Answer ─────────────────────────────────────────────────── */
export function TypeAnswer({
  exercise, onAnswer, disabled,
}: { exercise: Exercise; onAnswer: AnswerHandler; disabled: boolean }) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState<null | { correct: boolean; correct_answer: string }>(null);

  const handleCheck = async () => {
    if (!value.trim() || result || disabled) return;
    const res = await checkAnswer(exercise.id, value.trim());
    setResult(res);
    onAnswer(res.correct, res.correct_answer, res.hearts_remaining);
  };

  return (
    <>
      <input
        className={`type-input ${result ? (result.correct ? 'correct' : 'wrong') : ''}`}
        placeholder="Type your answer..."
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleCheck()}
        disabled={!!result || disabled}
        autoFocus
      />
      {exercise.hint && <p className="exercise-sub" style={{ marginTop: 12 }}>💡 {exercise.hint}</p>}
      {!result && !disabled && (
        <button className="btn btn-green" style={{ marginTop: 20 }} onClick={handleCheck} disabled={!value.trim()}>
          Check
        </button>
      )}
    </>
  );
}

/* ── Match Pairs ─────────────────────────────────────────────────── */
export function MatchPairs({
  exercise, onAnswer, onHeartLost, disabled,
}: {
  exercise: Exercise;
  onAnswer: AnswerHandler;
  onHeartLost: (heartsRemaining: number) => void;
  disabled: boolean;
}) {
  const pairs = exercise.match_pairs ?? [];
  const [selLeft, setSelLeft] = useState<string | null>(null);
  const [selRight, setSelRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const lefts = pairs.map(p => p.left);
  const rights = [...pairs.map(p => p.right)].sort(() => Math.random() - 0.5);

  const submitAllMatched = async (next: Set<string>) => {
    const encoded = lefts
      .map(l => {
        const pair = pairs.find(p => p.left === l);
        return pair ? `${l}=${pair.right}` : '';
      })
      .filter(Boolean)
      .join(',');
    const res = await checkAnswer(exercise.id, encoded);
    setDone(true);
    onAnswer(res.correct, res.correct_answer, res.hearts_remaining);
  };

  const attempt = async (l: string, r: string) => {
    const pair = pairs.find(p => p.left === l);
    if (pair?.right === r) {
      const next = new Set(matched).add(l).add(r);
      setMatched(next);
      if (next.size === pairs.length * 2) {
        submitAllMatched(next);
      }
    } else {
      setWrong([l, r]);
      setTimeout(() => setWrong([]), 600);
      try {
        const user = await deductHeart();
        onHeartLost(user.hearts);
      } catch {
        /* keep local state if API unavailable */
      }
    }
    setSelLeft(null); setSelRight(null);
  };

  const clickLeft = (l: string) => {
    if (matched.has(l) || disabled || done) return;
    const next = selLeft === l ? null : l;
    setSelLeft(next);
    if (next && selRight) attempt(next, selRight);
  };
  const clickRight = (r: string) => {
    if (matched.has(r) || disabled || done) return;
    const next = selRight === r ? null : r;
    setSelRight(next);
    if (selLeft && next) attempt(selLeft, next);
  };

  return (
    <div className="match-grid">
      {lefts.map((l, i) => (
        <button key={`l${i}`}
          className={`match-card${matched.has(l) ? ' matched' : selLeft === l ? ' selected' : wrong.includes(l) ? ' wrong' : ''}`}
          onClick={() => clickLeft(l)} disabled={matched.has(l) || done}>
          {l}
        </button>
      ))}
      {rights.map((r, i) => (
        <button key={`r${i}`}
          className={`match-card${matched.has(r) ? ' matched' : selRight === r ? ' selected' : wrong.includes(r) ? ' wrong' : ''}`}
          onClick={() => clickRight(r)} disabled={matched.has(r) || done}>
          {r}
        </button>
      ))}
    </div>
  );
}
