import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    const result = cn('px-4', 'py-2', 'bg-blue-500');
    expect(result).toBe('px-4 py-2 bg-blue-500');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toBe('base-class active-class');
  });

  it('filters out falsy values', () => {
    const result = cn('base-class', false && 'hidden-class', null, undefined, 'visible-class');
    expect(result).toBe('base-class visible-class');
  });

  it('handles Tailwind class conflicts by preferring later classes', () => {
    const result = cn('p-4', 'p-8'); // padding conflict
    expect(result).toBe('p-8');
  });

  it('merges complex Tailwind conflicts correctly', () => {
    const result = cn('bg-red-500 text-white', 'bg-blue-500'); // background conflict
    expect(result).toBe('text-white bg-blue-500');
  });

  it('handles empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('handles arrays of classes', () => {
    const result = cn(['px-4', 'py-2'], 'bg-blue-500');
    expect(result).toBe('px-4 py-2 bg-blue-500');
  });

  it('handles objects with conditional classes', () => {
    const result = cn({
      'base-class': true,
      'active-class': true,
      'hidden-class': false
    });
    expect(result).toBe('base-class active-class');
  });
});