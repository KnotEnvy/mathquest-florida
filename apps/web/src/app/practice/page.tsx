// apps/web/src/app/practice/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { QuestionCard } from '@/components/questions/QuestionCard';
import { Button } from '@/components/ui/button';

interface Question {
  id: string;
  content: any;
  domain: string;
  difficulty: number;
}

export default function PracticePage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

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

  const handleAnswer = (answer: string, isCorrect: boolean) => {
    if (isCorrect) {
      setScore(score + 1);
    }

    // Move to next question after a delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCompleted(true);
      }
    }, 2000);
  };

  const restart = () => {
    setCurrentIndex(0);
    setScore(0);
    setCompleted(false);
    fetchQuestions();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-magenta-primary mx-auto mb-4"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold mb-4">Practice Complete! 🎉</h2>
          <p className="text-xl mb-6">
            Your Score: <span className="font-bold text-magenta-primary">{score}/{questions.length}</span>
          </p>
          <div className="mb-6">
            <div className="text-6xl mb-2">
              {score === questions.length ? '🏆' : score >= questions.length * 0.7 ? '🌟' : '💪'}
            </div>
            <p className="text-gray-600">
              {score === questions.length 
                ? 'Perfect score! Amazing work!' 
                : score >= questions.length * 0.7 
                ? 'Great job! Keep it up!' 
                : 'Keep practicing, you\'ll get there!'}
            </p>
          </div>
          <Button onClick={restart} size="lg">
            Practice Again
          </Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No questions available. Please check your database setup.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-6 max-w-2xl mx-auto">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>Score: {score}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-magenta-primary h-2 rounded-full transition-all duration-300"
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