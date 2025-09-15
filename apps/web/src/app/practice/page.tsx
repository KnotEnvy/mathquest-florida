// apps/web/src/app/practice/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QuestionCard } from '@/components/questions/QuestionCard';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/navigation';
import { useAuth } from '@/lib/auth';
import { Trophy, PartyPopper, ThumbsUp } from 'lucide-react';

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

export default function PracticePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [sessionStartTime] = useState<Date>(new Date());

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions?count=5');
      const data = await response.json();
      setQuestions(data.questions);
      setLoading(false);
    } catch (error) {
      console.error('Error loading questions:', error);
      setLoading(false);
    }
  };

  const handleAnswer = async (answer: string, isCorrect: boolean, timeSpent: number) => {
    if (isCorrect) {
      setScore((s) => s + 1);
    }

    // Save attempt to database if user is authenticated
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

    // Move to next question after a delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setCompleted(true);
        // Update streak when practice session is completed
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
        console.log(`Streak increased to ${result.currentStreak}! 🎉`);
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setScore(0);
    setCompleted(false);
    fetchQuestions();
  };

  // Show auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
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
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-3xl font-bold mb-4">
              Practice Complete!{' '}
              <PartyPopper className="inline h-8 w-8 text-purple-600 align-[-2px]" aria-hidden="true" />
            </h2>
            <p className="text-xl mb-6">
              Your Score: <span className="font-bold text-purple-600">{score}/{questions.length}</span>
            </p>
            {user ? (
              <p className="text-sm text-gray-500 mb-4">
                Progress saved to your account!
              </p>
            ) : (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-blue-800 mb-2">
                  Want to save your progress?
                </p>
                <Button
                  onClick={() => router.push('/register')}
                  size="sm"
                  variant="outline"
                >
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
      <div className="container mx-auto px-4 pt-8">
        {/* Progress Bar */}
        <div className="mb-6 max-w-2xl mx-auto">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>Score: {score}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <QuestionCard
          key={currentQuestion.id}
          content={currentQuestion.content}
          onAnswer={handleAnswer}
        />

        {/* Domain & Difficulty Info */}
        <div className="mt-4 text-center text-sm text-gray-500">
          Domain: {currentQuestion.domain} |
          Difficulty: {currentQuestion.difficulty > 0.5 ? 'Hard' : currentQuestion.difficulty > -0.5 ? 'Medium' : 'Easy'}
        </div>
      </div>
    </div>
  );
}

