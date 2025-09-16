import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CoachPanel } from './CoachPanel';

const question = {
  id: 'q-1',
  prompt: 'Solve 2x + 3 = 11',
  choices: ['2', '3', '4', '5'],
  domain: 'Algebra',
  difficulty: 0.2,
};

const attemptSummary = {
  attempts: 1,
  lastAnswer: '5',
  correct: false,
  streak: 3,
};

describe('CoachPanel', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Try isolating x.', mode: 'hint' }),
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders default state with hint mode selected and send disabled', () => {
    render(
      <CoachPanel
        question={question}
        attemptSummary={attemptSummary}
      />,
    );

    const hintButton = screen.getByRole('button', { name: /hint/i });
    expect(hintButton).toHaveAttribute('aria-pressed', 'true');

    const explainButton = screen.getByRole('button', { name: /explain/i });
    expect(explainButton).toBeEnabled();

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('submits a question to the coach endpoint and displays response', async () => {
    render(
      <CoachPanel
        question={question}
        attemptSummary={attemptSummary}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText(/coach, how do i get started/i), {
      target: { value: 'What is the first step?' },
    });

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeEnabled();
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/coach',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    const [, requestInit] = fetchMock.mock.calls[0];
    const payload = JSON.parse((requestInit as RequestInit).body as string);
    expect(payload.mode).toBe('hint');
    expect(payload.messages).toHaveLength(1);
    expect(payload.question.prompt).toContain('2x + 3');

    await screen.findByText('Try isolating x.');
    expect(screen.getByText('What is the first step?')).toBeInTheDocument();
  });

  it('switches modes and surfaces errors gracefully', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Service unavailable' }),
    });

    render(
      <CoachPanel
        question={question}
        attemptSummary={attemptSummary}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /explain/i }));

    fireEvent.change(screen.getByPlaceholderText(/coach, how do i get started/i), {
      target: { value: 'Please explain fully' },
    });

    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const [, init] = fetchMock.mock.calls[0];
    const payload = JSON.parse((init as RequestInit).body as string);
    expect(payload.mode).toBe('explain');

    await screen.findByText(/service unavailable/i);
    expect(screen.queryByText('Please explain fully')).not.toBeInTheDocument();
  });
});

