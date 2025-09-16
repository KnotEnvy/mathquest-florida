// apps/web/src/app/practice/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, PartyPopper, ThumbsUp } from 'lucide-react';
import { QuestionCard } from '@/components/questions/QuestionCard';
import { CoachPanel } from '@/components/coach/CoachPanel';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/lib/auth';

interface QuestionContent {
  type: 'multiple-choice' | 'grid-in';
  question: string;
  choices?: string[];
  correctAnswer: string;
  explanation: string;
}

interface Question {
  id: string;
  content: QuestionContent;
  domain: string;
  difficulty: number;
}

const ABILITY_STORAGE_KEY = 'mathquestAbilityEstimate';

function calculateAbility(score: number, attempts: number): number {
  if (!attempts) {
    return 0;
  }
  const accuracy = score / attempts;
  const scaled = (accuracy - 0.6) * 5; // roughly map 60% accuracy to ability 0
  const clamped = Math.max(-2.5, Math.min(2.5, scaled));
  return Number(clamped.toFixed(2));
}

export default function PracticePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastAttempt, setLastAttempt] = useState<{ answer: string; correct: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [abilityEstimate, setAbilityEstimate] = useState<number | null>(null);

  useEffect(() => {
    let initialAbility: number | null = null;
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(ABILITY_STORAGE_KEY);
      if (stored) {
        const parsed = Number.parseFloat(stored);
        if (!Number.isNaN(parsed)) {
          initialAbility = parsed;
          setAbilityEstimate(parsed);
        }
      }
    }
    fetchQuestions(initialAbility);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (abilityEstimate === null) return;
    window.localStorage.setItem(ABILITY_STORAGE_KEY, abilityEstimate.toFixed(2));
  }, [abilityEstimate]);

  const fetchQuestions = async (targetAbility: number | null = abilityEstimate) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ count: '5' });
      if (typeof targetAbility === 'number') {
        params.set('ability', targetAbility.toFixed(2));
      }
      const response = await fetch(`/api/questions?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to load questions');
      }
      const data = await response.json();
      setQuestions(Array.isArray(data.questions) ? data.questions : []);
      setCurrentIndex(0);
      setScore(0);
      setAttemptCount(0);
      setLastAttempt(null);
      setCompleted(false);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: string, isCorrect: boolean, timeSpent: number) => {
    const nextScore = isCorrect ? score + 1 : score;
    const nextAttempts = attemptCount + 1;

    if (isCorrect) {
      setScore((value) => value + 1);
    }
    setAttemptCount((value) => value + 1);
    setLastAttempt({ answer, correct: isCorrect });

    if (user && questions[currentIndex]) {
      try {
        const response = await fetch('/api/attempts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionId: questions[currentIndex].id,
            answer,
            correct: isCorrect,
            timeSpent,
          }),
        });

        const result = await response.json();
        if (result.success) {
          console.log(`XP gained: ${result.attempt.xpGained} points!`);
        }
      } catch (error) {
        console.error('Error saving attempt:', error);
      }
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((index) => index + 1);
      } else {
        setCompleted(true);
        const updatedAbility = calculateAbility(nextScore, nextAttempts);
        setAbilityEstimate(updatedAbility);
        if (user) {
          updateStreak();
        }
      }
    }, 2000);
  };

  const updateStreak = async () => {
    try {
      const response = await fetch('/api/streaks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.streakIncreased) {
        console.log(`Streak increased to ${result.currentStreak}! dYZ%`);
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const restart = () => {
    fetchQuestions(abilityEstimate);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600" />
            <p>Checking your session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center pt-24">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600" />
            <p>Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
            <h2 className="mb-4 text-3xl font-bold">
              Practice Complete!{' '}
              <PartyPopper className="inline h-8 w-8 text-purple-600 align-[-2px]" aria-hidden="true" />
            </h2>
            <p className="mb-6 text-xl">
              Your Score: <span className="font-bold text-purple-600">{score}/{questions.length}</span>
            </p>
            {abilityEstimate !== null && (
              <p className="mb-6 text-sm text-gray-500">
                Coach difficulty calibrated to ability {abilityEstimate >= 0 ? '+' : ''}
                {abilityEstimate.toFixed(2)}
              </p>
            )}
            {user ? (
              <p className="mb-4 text-sm text-gray-500">Progress saved to your account!</p>
            ) : (
              <div className="mb-6 rounded-lg bg-blue-50 p-4">
                <p className="mb-2 text-sm text-blue-800">Want to save your progress?</p>
                <Button onClick={() => router.push('/register')} size="sm" variant="outline">
                  Create Account
                </Button>
              </div>
            )}
            <div className="mb-6">
              <div className="mb-2">
                {score === questions.length ? (
                  <Trophy className="inline h-12 w-12 text-yellow-500" aria-label="Perfect score" />
                ) : score >= questions.length * 0.7 ? (
                  <PartyPopper className="inline h-12 w-12 text-purple-600" aria-label="Great job" />
                ) : (
                  <ThumbsUp className="inline h-12 w-12 text-gray-500" aria-label="Keep practicing" />
                )}
              </div>
              <p className="text-gray-600">
                {score === questions.length
                  ? 'Perfect score! Amazing work!'
                  : score >= questions.length * 0.7
                  ? 'Great job! Keep it up!'
                  : "Keep practicing, you'll get there!"}
              </p>
            </div>
            <div className="space-y-2">
              <Button onClick={restart} size="lg" className="w-full">
                Practice Again
              </Button>
              {user && (
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  View Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <p>No questions available. Please check your database setup.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 pb-16 pt-8">
        <div className="mx-auto mb-6 max-w-2xl">
          <div className="mb-2 flex justify-between text-sm text-gray-600">
            <span>
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span>Score: {score}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-purple-600 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <QuestionCard
              key={currentQuestion.id}
              content={currentQuestion.content}
              onAnswer={handleAnswer}
            />
            <div className="text-center text-sm text-gray-500">
              Domain: {currentQuestion.domain} |
              Difficulty: {currentQuestion.difficulty > 0.5
                ? 'Hard'
                : currentQuestion.difficulty > -0.5
                ? 'Medium'
                : 'Easy'}
            </div>
          </div>

          <CoachPanel
            question={{
              id: currentQuestion.id,
              prompt: currentQuestion.content.question,
              choices: currentQuestion.content.choices,
              domain: currentQuestion.domain,
              difficulty: currentQuestion.difficulty,
            }}
            attemptSummary={{
              attempts: attemptCount,
              lastAnswer: lastAttempt?.answer,
              correct: lastAttempt?.correct,
            }}
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}
