// apps/web/src/components/questions/QuestionCard.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface QuestionContent {
  type: 'multiple-choice' | 'grid-in';
  question: string;
  choices?: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuestionCardProps {
  content: QuestionContent;
  onAnswer: (answer: string, isCorrect: boolean) => void;
}

export function QuestionCard({ content, onAnswer }: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Function to render math expressions
  const renderMathText = (text: string) => {
    // Split text by math expressions (enclosed in $ or $$)
    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        // Block math
        return <BlockMath key={index} math={part.slice(2, -2)} />;
      } else if (part.startsWith('$') && part.endsWith('$')) {
        // Inline math
        return <InlineMath key={index} math={part.slice(1, -1)} />;
      } else {
        // Regular text
        return <span key={index}>{part}</span>;
      }
    });
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;

    const correct = selectedAnswer === content.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    onAnswer(selectedAnswer, correct);
  };

  const handleNext = () => {
    setSelectedAnswer('');
    setShowResult(false);
    setIsCorrect(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Question */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Question</h3>
        <div className="text-lg">
          {renderMathText(content.question)}
        </div>
      </div>

      {/* Answer Options */}
      {content.type === 'multiple-choice' && content.choices && (
        <div className="space-y-3 mb-6">
          {content.choices.map((choice, index) => (
            <button
              key={index}
              onClick={() => !showResult && setSelectedAnswer(choice)}
              disabled={showResult}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedAnswer === choice
                  ? showResult
                    ? isCorrect && choice === content.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : !isCorrect && choice === selectedAnswer
                      ? 'border-red-500 bg-red-50'
                      : choice === content.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300'
                    : 'border-blue-500 bg-blue-50'
                  : showResult && choice === content.correctAnswer
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center">
                <span className="font-semibold mr-3">
                  {String.fromCharCode(65 + index)})
                </span>
                <span>{renderMathText(choice)}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Grid-in input */}
      {content.type === 'grid-in' && (
        <div className="mb-6">
          <input
            type="text"
            value={selectedAnswer}
            onChange={(e) => !showResult && setSelectedAnswer(e.target.value)}
            disabled={showResult}
            placeholder="Enter your answer"
            className={`w-full p-4 text-lg border-2 rounded-lg ${
              showResult
                ? isCorrect
                  ? 'border-green-500 bg-green-50'
                  : 'border-red-500 bg-red-50'
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />
        </div>
      )}

      {/* Result Feedback */}
      {showResult && (
        <div className={`mb-6 p-4 rounded-lg ${
          isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <p className="font-semibold mb-2">
            {isCorrect ? '✅ Correct!' : '❌ Incorrect'}
          </p>
          <p className="text-sm">
            <strong>Explanation:</strong> {renderMathText(content.explanation)}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        {!showResult ? (
          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className="ml-auto"
          >
            Submit Answer
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="ml-auto"
          >
            Next Question
          </Button>
        )}
      </div>
    </div>
  );
}
