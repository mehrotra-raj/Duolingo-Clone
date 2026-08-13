'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchLesson, fetchUser, completeLesson } from '@/lib/api';
import type { Lesson, Exercise, LessonCompleteResponse } from '@/lib/types';
import {
  MultipleChoice, WordBank, FillBlank, TypeAnswer, MatchPairs,
} from '@/components/lesson/Exercises';

/* ── Feedback bar ─────────────────────────────────────────────────── */
function FeedbackBar({
  correct, correctAnswer, onContinue,
}: { correct: boolean; correctAnswer: string; onContinue: () => void }) {
  return (
    <div className={`feedback-bar ${correct ? 'correct' : 'wrong'}`}>
      <div>
        <div className="feedback-icon">{correct ? '✅' : '❌'}</div>
        <div className="feedback-title">{correct ? 'Correct!' : 'Incorrect'}</div>
        {!correct && <div className="feedback-subtitle">Correct answer: {correctAnswer}</div>}
      </div>
      <button className={`btn ${correct ? 'btn-green' : 'btn-red'}`} onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}

/* ── Lesson Complete ──────────────────────────────────────────────── */
function LessonComplete({
  xp, accuracy, streak, onContinue,
}: { xp: number; accuracy: number; streak: number; onContinue: () => void }) {
  return (
    <div className="lesson-complete">
      <div className="complete-burst">🎉</div>
      <div className="complete-title">Lesson Complete!</div>
      <div className="complete-stats">
        <div className="complete-stat">
          <div className="complete-stat-val" style={{ color: 'var(--duo-gold)' }}>+{xp}</div>
          <div className="complete-stat-lbl">XP Earned</div>
        </div>
        <div className="complete-stat">
          <div className="complete-stat-val" style={{ color: 'var(--duo-green)' }}>{accuracy}%</div>
          <div className="complete-stat-lbl">Accuracy</div>
        </div>
        <div className="complete-stat">
          <div className="complete-stat-val" style={{ color: 'var(--duo-orange)' }}>🔥 {streak}</div>
          <div className="complete-stat-lbl">Streak</div>
        </div>
      </div>
      <button className="btn btn-green" style={{ padding: '16px 48px', fontSize: 18 }} onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}

/* ── Out of Hearts ────────────────────────────────────────────────── */
function OutOfHearts({ onLeave }: { onLeave: () => void }) {
  return (
    <div className="hearts-modal-overlay">
      <div className="hearts-modal">
        <div style={{ fontSize: 64 }}>💔</div>
        <h2>Out of Hearts!</h2>
        <p>You've run out of hearts. Hearts regenerate 1 every 4 hours, or you can refill with gems.</p>
        <button className="btn btn-red" style={{ width: '100%' }} onClick={onLeave}>
          Return to Home
        </button>
      </div>
    </div>
  );
}

/* ── Main Lesson Page ─────────────────────────────────────────────── */
export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [maxHearts, setMaxHearts] = useState(5);
  const [current, setCurrent] = useState(0);
  const [hearts, setHearts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [heartsLost, setHeartsLost] = useState(0);
  const [loading, setLoading] = useState(true);

  // feedback state
  const [feedback, setFeedback] = useState<{ correct: boolean; correctAnswer: string } | null>(null);
  const [answered, setAnswered] = useState(false);

  // end states
  const [completed, setCompleted] = useState(false);
  const [completionResult, setCompletionResult] = useState<LessonCompleteResponse | null>(null);
  const [outOfHearts, setOutOfHearts] = useState(false);

  // Confirm quit
  const [showQuit, setShowQuit] = useState(false);

  useEffect(() => {
    Promise.all([fetchUser(), fetchLesson(Number(id))])
      .then(([user, lessonData]) => {
        setLesson(lessonData);
        setHearts(user.hearts);
        setMaxHearts(user.max_hearts);
        if (user.hearts <= 0) setOutOfHearts(true);
      })
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const goHome = () => {
    sessionStorage.setItem('refreshHome', '1');
    router.push('/');
  };

  const handleAnswer = useCallback((correct: boolean, correctAnswer: string) => {
    if (answered) return;
    setAnswered(true);
    if (correct) {
      setCorrectCount(c => c + 1);
      setFeedback({ correct: true, correctAnswer });
    } else {
      const newHearts = hearts - 1;
      setHearts(newHearts);
      setHeartsLost(h => h + 1);
      setFeedback({ correct: false, correctAnswer });
      if (newHearts <= 0) {
        setTimeout(() => setOutOfHearts(true), 1200);
      }
    }
  }, [answered, hearts]);

  // Wrap per-exercise onAnswer to also pass correctAnswer
  const makeHandler = (exercise: Exercise) => (correct: boolean) => {
    handleAnswer(correct, exercise.correct_answer ?? '');
  };

  const handleContinue = async () => {
    setFeedback(null);
    setAnswered(false);

    if (!lesson) return;
    const nextIdx = current + 1;

    if (nextIdx >= lesson.exercises.length) {
      const total = lesson.exercises.length;
      try {
        const result = await completeLesson(lesson.id, {
          hearts_lost: heartsLost,
          correct_answers: correctCount,
          total_exercises: total,
        });
        setCompletionResult(result);
        setHearts(result.hearts_remaining);
      } catch {
        setCompletionResult({
          xp_earned: lesson.xp_reward,
          total_xp: 0,
          hearts_remaining: hearts,
          streak: 0,
          skill_progress: { lessons_completed: 0, crown_level: 0, is_unlocked: true, total_lessons: 0 },
          achievements_earned: [],
        });
      }
      setCompleted(true);
    } else {
      setCurrent(nextIdx);
    }
  };

  if (loading || !lesson) {
    return (
      <div className="lesson-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 48 }}>⏳</div>
        <p style={{ marginTop: 16, fontWeight: 700, color: '#AFAFAF' }}>Loading lesson...</p>
      </div>
    );
  }

  const totalEx = lesson.exercises.length;
  const progress = totalEx > 0 ? (current / totalEx) * 100 : 0;
  const accuracy = totalEx > 0 ? Math.round((correctCount / totalEx) * 100) : 100;

  if (outOfHearts && !completed) {
    return (
      <div className="lesson-shell" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <OutOfHearts onLeave={goHome} />
      </div>
    );
  }

  if (completed && completionResult) {
    return (
      <LessonComplete
        xp={completionResult.xp_earned}
        accuracy={accuracy}
        streak={completionResult.streak}
        onContinue={goHome}
      />
    );
  }

  const exercise = lesson.exercises[current];

  const renderExercise = () => {
    const props = { exercise, onAnswer: makeHandler(exercise), disabled: answered };
    switch (exercise.type) {
      case 'multiple_choice':    return <MultipleChoice {...props} />;
      case 'translate_word_bank': return <WordBank {...props} />;
      case 'fill_blank':         return <FillBlank {...props} />;
      case 'type_answer':        return <TypeAnswer {...props} />;
      case 'match_pairs':        return <MatchPairs exercise={exercise} onAnswer={(c, ans) => handleAnswer(c, ans ?? '')} disabled={answered} />;
      default:                   return <p>Unknown exercise type</p>;
    }
  };

  return (
    <div className="lesson-shell">
      {/* Top bar */}
      <div className="lesson-topbar">
        <button className="lesson-close-btn" onClick={() => setShowQuit(true)}>✕</button>
        <div className="lesson-progress-bar-track">
          <div className="lesson-progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="lesson-hearts">
          {Array.from({ length: maxHearts }).map((_, i) => (
            <span key={i} style={{ opacity: i < hearts ? 1 : 0.2, transition: 'opacity 300ms' }}>❤️</span>
          ))}
        </div>
      </div>

      {/* Exercise body */}
      <div className="lesson-body">
        <p className="exercise-sub">
          {exercise.type === 'multiple_choice' ? 'Tap the correct option' :
            exercise.type === 'translate_word_bank' ? 'Tap the words in order' :
              exercise.type === 'match_pairs' ? 'Match the pairs' :
                exercise.type === 'fill_blank' ? 'Choose the missing word' :
                  'Type your answer'}
        </p>
        <h2 className="exercise-prompt">{exercise.prompt}</h2>
        {renderExercise()}
      </div>

      {/* Feedback */}
      {feedback && !outOfHearts && (
        <FeedbackBar
          correct={feedback.correct}
          correctAnswer={feedback.correctAnswer}
          onContinue={handleContinue}
        />
      )}

      {/* Footer check button (for types that need external submit) */}
      {!feedback && !answered && exercise.type === 'match_pairs' && (
        <div className="lesson-footer">
          <span style={{ color: '#AFAFAF', fontWeight: 600, fontSize: 14 }}>Match all pairs to continue</span>
        </div>
      )}

      {/* Out of hearts */}
      {outOfHearts && <OutOfHearts onLeave={goHome} />}

      {/* Quit confirmation */}
      {showQuit && (
        <div className="hearts-modal-overlay">
          <div className="hearts-modal">
            <div style={{ fontSize: 48 }}>🤔</div>
            <h2 style={{ color: 'var(--duo-dark)' }}>Quit lesson?</h2>
            <p>Your progress will be lost.</p>
            <button className="btn btn-red" style={{ width: '100%' }} onClick={goHome}>
              Quit
            </button>
            <button
              onClick={() => setShowQuit(false)}
              style={{ marginTop: 12, width: '100%', background: 'none', border: 'none', color: '#AFAFAF', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}
            >
              Keep Learning
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
