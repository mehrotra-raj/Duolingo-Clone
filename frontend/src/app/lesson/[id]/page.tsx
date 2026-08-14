'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchLesson, fetchUser, completeLesson } from '@/lib/api';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Lesson, Exercise, LessonCompleteResponse } from '@/lib/types';
import {
  MultipleChoice, WordBank, FillBlank, TypeAnswer, MatchPairs,
} from '@/components/lesson/Exercises';
import { IconClose, IconHeart, IconCheck } from '@/components/icons';

function FeedbackBar({
  correct, correctAnswer, onContinue,
}: { correct: boolean; correctAnswer: string; onContinue: () => void }) {
  return (
    <div className={`feedback-bar ${correct ? 'correct' : 'wrong'}`}>
      <div className="feedback-content">
        <div className="feedback-icon-wrap">
          {correct ? <IconCheck /> : <IconClose />}
        </div>
        <div>
          <div className="feedback-title">{correct ? 'Nice job!' : 'Correct solution:'}</div>
          {!correct && <div className="feedback-subtitle">{correctAnswer}</div>}
        </div>
      </div>
      <button type="button" className={`btn ${correct ? 'btn-green' : 'btn-red'}`} onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}

function LessonComplete({
  xpEarned, totalXp, accuracy, streak, achievements, onContinue,
}: {
  xpEarned: number;
  totalXp: number;
  accuracy: number;
  streak: number;
  achievements: string[];
  onContinue: () => void;
}) {
  return (
    <div className="lesson-complete">
      <div className="complete-burst">🎉</div>
      <div className="complete-title">Lesson complete!</div>
      {achievements.length > 0 && (
        <div className="lesson-achievements">
          {achievements.map(name => (
            <span key={name} className="lesson-achievement-badge">🏆 {name}</span>
          ))}
        </div>
      )}
      <div className="complete-stats">
        <div className="complete-stat">
          <div className="complete-stat-val" style={{ color: 'var(--duo-gold)' }}>+{xpEarned}</div>
          <div className="complete-stat-lbl">XP earned</div>
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
      <p className="complete-total-xp">Total XP: ⭐ {totalXp}</p>
      <button type="button" className="btn btn-green btn-lg" onClick={onContinue}>
        Continue
      </button>
    </div>
  );
}

function OutOfHearts({ onLeave }: { onLeave: () => void }) {
  return (
    <div className="hearts-modal-overlay">
      <div className="hearts-modal">
        <div className="hearts-modal-icon">💔</div>
        <h2>Out of hearts!</h2>
        <p>Hearts regenerate 1 every 4 hours, or you can refill with gems in the Shop.</p>
        <div className="hearts-modal-actions">
          <button type="button" className="btn btn-red" onClick={onLeave}>
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const reduceMotion = useReducedMotion();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [maxHearts, setMaxHearts] = useState(5);
  const [current, setCurrent] = useState(0);
  const [hearts, setHearts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completeError, setCompleteError] = useState('');

  const [feedback, setFeedback] = useState<{ correct: boolean; correctAnswer: string } | null>(null);
  const [answered, setAnswered] = useState(false);

  const [completed, setCompleted] = useState(false);
  const [completionResult, setCompletionResult] = useState<LessonCompleteResponse | null>(null);
  const [outOfHearts, setOutOfHearts] = useState(false);
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

  const handleHeartUpdate = useCallback((remaining: number) => {
    setHearts(remaining);
    if (remaining <= 0) {
      setTimeout(() => setOutOfHearts(true), 600);
    }
  }, []);

  const handleAnswer = useCallback((
    correct: boolean,
    correctAnswer: string,
    heartsRemaining: number,
  ) => {
    if (answered) return;
    setAnswered(true);
    setHearts(heartsRemaining);
    if (correct) {
      setCorrectCount(c => c + 1);
      setFeedback({ correct: true, correctAnswer });
    } else {
      setFeedback({ correct: false, correctAnswer });
      if (heartsRemaining <= 0) {
        setTimeout(() => setOutOfHearts(true), 1200);
      }
    }
  }, [answered]);

  const makeHandler = (exercise: Exercise) => (
    correct: boolean,
    correctAnswer?: string,
    heartsRemaining?: number,
  ) => {
    handleAnswer(correct, correctAnswer ?? '', heartsRemaining ?? hearts);
  };

  const handleContinue = async () => {
    setFeedback(null);
    setAnswered(false);

    if (!lesson) return;
    const nextIdx = current + 1;

    if (nextIdx >= lesson.exercises.length) {
      const total = lesson.exercises.length;
      setCompleteError('');
      try {
        const result = await completeLesson(lesson.id, {
          correct_answers: correctCount,
          total_exercises: total,
        });
        setCompletionResult(result);
        setHearts(result.hearts_remaining);
        setCompleted(true);
      } catch {
        setCompleteError('Could not save lesson progress. Hearts may have run out.');
      }
    } else {
      setCurrent(nextIdx);
    }
  };

  if (loading || !lesson) {
    return (
      <div className="lesson-shell">
        <div className="loading-state">
          <div className="loading-mascot">⏳</div>
          <p>Loading lesson...</p>
        </div>
      </div>
    );
  }

  const totalEx = lesson.exercises.length;
  const progress = totalEx > 0 ? ((current + (answered ? 1 : 0)) / totalEx) * 100 : 0;
  const accuracy = totalEx > 0 ? Math.round((correctCount / totalEx) * 100) : 100;

  if (outOfHearts && !completed) {
    return (
      <div className="lesson-shell">
        <OutOfHearts onLeave={goHome} />
      </div>
    );
  }

  if (completed && completionResult) {
    return (
      <LessonComplete
        xpEarned={completionResult.xp_earned}
        totalXp={completionResult.total_xp}
        accuracy={accuracy}
        streak={completionResult.streak}
        achievements={completionResult.achievements_earned}
        onContinue={goHome}
      />
    );
  }

  const exercise = lesson.exercises[current];
  const renderExercise = () => {
    const props = { exercise, onAnswer: makeHandler(exercise), disabled: answered };
    switch (exercise.type) {
      case 'multiple_choice':     return <MultipleChoice {...props} />;
      case 'translate_word_bank': return <WordBank {...props} />;
      case 'fill_blank':          return <FillBlank {...props} />;
      case 'type_answer':         return <TypeAnswer {...props} />;
      case 'match_pairs':
        return (
          <MatchPairs
            exercise={exercise}
            onAnswer={handleAnswer}
            onHeartLost={handleHeartUpdate}
            disabled={answered}
          />
        );
      default: return <p>Unknown exercise type</p>;
    }
  };
  const exerciseHint = {
    multiple_choice: 'Select the correct answer',
    translate_word_bank: 'Tap the words in order',
    match_pairs: 'Match the pairs',
    fill_blank: 'Choose the missing word',
    type_answer: 'Type your answer',
  }[exercise.type] ?? 'Answer the question';

  return (
    <div className="lesson-shell">
      <div className="lesson-topbar">
        <button type="button" className="lesson-close-btn" onClick={() => setShowQuit(true)} aria-label="Close lesson">
          <IconClose />
        </button>
        <div className="lesson-progress-bar-track">
          <div className="lesson-progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="lesson-hearts">
          {Array.from({ length: maxHearts }).map((_, i) => (
            <IconHeart key={i} filled={i < hearts} />
          ))}
        </div>
      </div>

      <div className="lesson-body">
        <p className="exercise-sub">{exerciseHint}</p>
        <h2 className="exercise-prompt">{exercise.prompt}</h2>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={current}
            initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.26, ease: 'easeOut' }}
          >
            {renderExercise()}
          </motion.div>
        </AnimatePresence>
        {completeError && (
          <p className="lesson-error">{completeError}</p>
        )}
      </div>

      <AnimatePresence>
        {feedback && !outOfHearts && (
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 12 }}
            transition={{ duration: 0.22 }}
            key="feedback"
          >
            <FeedbackBar
              correct={feedback.correct}
              correctAnswer={feedback.correctAnswer}
              onContinue={handleContinue}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!feedback && !answered && exercise.type === 'match_pairs' && (
        <div className="lesson-footer">
          <span style={{ color: 'var(--duo-gray2)', fontWeight: 700, fontSize: 14 }}>Match all pairs to continue</span>
        </div>
      )}

      {showQuit && (
        <div className="hearts-modal-overlay">
          <div className="hearts-modal">
            <div className="hearts-modal-icon">🤔</div>
            <h2 style={{ color: 'var(--duo-dark)' }}>Quit lesson?</h2>
            <p>Wrong answers already cost hearts. Lesson progress in this session will be lost.</p>
            <div className="hearts-modal-actions">
              <button type="button" className="btn btn-red" onClick={goHome}>Quit</button>
              <button type="button" className="modal-link-btn" onClick={() => setShowQuit(false)}>
                Keep Learning
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
