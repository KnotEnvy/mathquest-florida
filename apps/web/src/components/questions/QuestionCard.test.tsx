import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuestionCard } from './QuestionCard';

// Mock react-katex to avoid KaTeX rendering issues in tests
vi.mock('react-katex', () => ({
  InlineMath: ({ math }: { math: string }) => <span data-testid="inline-math">{math}</span>,
  BlockMath: ({ math }: { math: string }) => <div data-testid="block-math">{math}</div>,
}));

describe('QuestionCard', () => {
  const mockOnAnswer = vi.fn();

  const multipleChoiceQuestion = {
    type: 'multiple-choice' as const,
    question: 'What is $2 + 2$?',
    choices: ['3', '4', '5', '6'],
    correctAnswer: '4',
    explanation: 'Adding $2 + 2$ equals $4$.',
  };

  const gridInQuestion = {
    type: 'grid-in' as const,
    question: 'Calculate $$\\sqrt{16}$$',
    correctAnswer: '4',
    explanation: 'The square root of 16 is 4.',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Multiple Choice Questions', () => {
    it('renders multiple choice question correctly', () => {
      render(<QuestionCard content={multipleChoiceQuestion} onAnswer={mockOnAnswer} />);
      
      expect(screen.getByText('Question')).toBeInTheDocument();
      expect(screen.getByText('What is')).toBeInTheDocument();
      expect(screen.getByTestId('inline-math')).toHaveTextContent('2 + 2');
      
      // Check all choices are rendered
      multipleChoiceQuestion.choices!.forEach((choice, index) => {
        expect(screen.getByText(choice)).toBeInTheDocument();
        expect(screen.getByText(`${String.fromCharCode(65 + index)})`)).toBeInTheDocument();
      });
      
      expect(screen.getByRole('button', { name: 'Submit Answer' })).toBeInTheDocument();
    });

    it('allows selecting an answer', () => {
      render(<QuestionCard content={multipleChoiceQuestion} onAnswer={mockOnAnswer} />);
      
      const choiceButtons = screen.getAllByText('4');
      const choiceButton = choiceButtons.find(button => button.closest('button'))?.closest('button')!;
      fireEvent.click(choiceButton);
      
      expect(choiceButton).toHaveClass('border-blue-500', 'bg-blue-50');
    });

    it('submits correct answer and shows positive feedback', async () => {
      render(<QuestionCard content={multipleChoiceQuestion} onAnswer={mockOnAnswer} />);
      
      // Select correct answer
      fireEvent.click(screen.getByText('4'));
      
      // Submit
      fireEvent.click(screen.getByRole('button', { name: 'Submit Answer' }));
      
      // Check callback was called with correct parameters
      expect(mockOnAnswer).toHaveBeenCalledWith('4', true, expect.any(Number));
      
      // Check positive feedback
      await waitFor(() => {
        expect(screen.getByText('✅ Correct!')).toBeInTheDocument();
        expect(screen.getByText('Explanation:')).toBeInTheDocument();
      });
      
      // Check Next Question button appears
      expect(screen.getByRole('button', { name: 'Next Question' })).toBeInTheDocument();
    });

    it('submits incorrect answer and shows negative feedback', async () => {
      render(<QuestionCard content={multipleChoiceQuestion} onAnswer={mockOnAnswer} />);
      
      // Select incorrect answer
      fireEvent.click(screen.getByText('3'));
      
      // Submit
      fireEvent.click(screen.getByRole('button', { name: 'Submit Answer' }));
      
      // Check callback was called with correct parameters
      expect(mockOnAnswer).toHaveBeenCalledWith('3', false, expect.any(Number));
      
      // Check negative feedback
      await waitFor(() => {
        expect(screen.getByText('❌ Incorrect')).toBeInTheDocument();
      });
      
      // Check correct answer is highlighted
      const choiceButtons = screen.getAllByText('4');
      const correctChoiceButton = choiceButtons.find(button => button.closest('button'))?.closest('button')!;
      expect(correctChoiceButton).toHaveClass('border-green-500', 'bg-green-50');
    });

    it('disables choices after submission', async () => {
      render(<QuestionCard content={multipleChoiceQuestion} onAnswer={mockOnAnswer} />);
      
      const choiceButtons = screen.getAllByText('4');
      const choiceButton = choiceButtons.find(button => button.closest('button'))?.closest('button')!;
      fireEvent.click(choiceButton);
      fireEvent.click(screen.getByRole('button', { name: 'Submit Answer' }));
      
      await waitFor(() => {
        multipleChoiceQuestion.choices!.forEach((choice) => {
          const buttons = screen.getAllByText(choice);
          const button = buttons.find(btn => btn.closest('button'))?.closest('button')!;
          expect(button).toBeDisabled();
        });
      });
    });

    it('prevents submission without selecting an answer', () => {
      render(<QuestionCard content={multipleChoiceQuestion} onAnswer={mockOnAnswer} />);
      
      const submitButton = screen.getByRole('button', { name: 'Submit Answer' });
      expect(submitButton).toBeDisabled();
      
      fireEvent.click(submitButton);
      expect(mockOnAnswer).not.toHaveBeenCalled();
    });
  });

  describe('Grid-in Questions', () => {
    it('renders grid-in question correctly', () => {
      render(<QuestionCard content={gridInQuestion} onAnswer={mockOnAnswer} />);
      
      expect(screen.getByText('Calculate')).toBeInTheDocument();
      expect(screen.getByTestId('block-math')).toHaveTextContent('\\sqrt{16}');
      expect(screen.getByPlaceholderText('Enter your answer')).toBeInTheDocument();
    });

    it('allows typing an answer', () => {
      render(<QuestionCard content={gridInQuestion} onAnswer={mockOnAnswer} />);
      
      const input = screen.getByPlaceholderText('Enter your answer') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '4' } });
      
      expect(input.value).toBe('4');
    });

    it('submits correct grid-in answer', async () => {
      render(<QuestionCard content={gridInQuestion} onAnswer={mockOnAnswer} />);
      
      const input = screen.getByPlaceholderText('Enter your answer');
      fireEvent.change(input, { target: { value: '4' } });
      
      fireEvent.click(screen.getByRole('button', { name: 'Submit Answer' }));
      
      expect(mockOnAnswer).toHaveBeenCalledWith('4', true, expect.any(Number));
      
      await waitFor(() => {
        expect(screen.getByText('✅ Correct!')).toBeInTheDocument();
      });
    });

    it('submits incorrect grid-in answer', async () => {
      render(<QuestionCard content={gridInQuestion} onAnswer={mockOnAnswer} />);
      
      const input = screen.getByPlaceholderText('Enter your answer');
      fireEvent.change(input, { target: { value: '5' } });
      
      fireEvent.click(screen.getByRole('button', { name: 'Submit Answer' }));
      
      expect(mockOnAnswer).toHaveBeenCalledWith('5', false, expect.any(Number));
      
      await waitFor(() => {
        expect(screen.getByText('❌ Incorrect')).toBeInTheDocument();
      });
    });

    it('disables input after submission', async () => {
      render(<QuestionCard content={gridInQuestion} onAnswer={mockOnAnswer} />);
      
      const input = screen.getByPlaceholderText('Enter your answer') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '4' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit Answer' }));
      
      await waitFor(() => {
        expect(input).toBeDisabled();
      });
    });
  });

  describe('Math Rendering', () => {
    it('renders inline math expressions', () => {
      const questionWithMath = {
        ...multipleChoiceQuestion,
        question: 'What is $x^2 + 2x + 1$ when $x = 1$?',
      };
      
      render(<QuestionCard content={questionWithMath} onAnswer={mockOnAnswer} />);
      
      const mathElements = screen.getAllByTestId('inline-math');
      expect(mathElements).toHaveLength(2);
      expect(mathElements[0]).toHaveTextContent('x^2 + 2x + 1');
      expect(mathElements[1]).toHaveTextContent('x = 1');
    });

    it('renders block math expressions', () => {
      const questionWithBlockMath = {
        ...gridInQuestion,
        question: 'Solve: $$\\int_0^1 x^2 dx$$',
      };
      
      render(<QuestionCard content={questionWithBlockMath} onAnswer={mockOnAnswer} />);
      
      const blockMath = screen.getByTestId('block-math');
      expect(blockMath).toHaveTextContent('\\int_0^1 x^2 dx');
    });
  });

  describe('Time Tracking', () => {
    it('tracks time spent on question', async () => {
      render(<QuestionCard content={multipleChoiceQuestion} onAnswer={mockOnAnswer} />);
      
      // Wait a bit to simulate time passing
      await new Promise(resolve => setTimeout(resolve, 50));
      
      fireEvent.click(screen.getByText('4'));
      fireEvent.click(screen.getByRole('button', { name: 'Submit Answer' }));
      
      const [, , timeSpent] = mockOnAnswer.mock.calls[0];
      expect(timeSpent).toBeGreaterThan(0);
    });
  });

  describe('Next Question Flow', () => {
    it('resets state when next question is clicked', async () => {
      render(<QuestionCard content={multipleChoiceQuestion} onAnswer={mockOnAnswer} />);
      
      // Submit an answer
      fireEvent.click(screen.getByText('4'));
      fireEvent.click(screen.getByRole('button', { name: 'Submit Answer' }));
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Next Question' })).toBeInTheDocument();
      });
      
      // Click next question (this would typically trigger parent to show new question)
      fireEvent.click(screen.getByRole('button', { name: 'Next Question' }));
      
      // The component should reset its internal state
      expect(screen.getByRole('button', { name: 'Submit Answer' })).toBeInTheDocument();
      expect(screen.queryByText('✅ Correct!')).not.toBeInTheDocument();
    });
  });
});