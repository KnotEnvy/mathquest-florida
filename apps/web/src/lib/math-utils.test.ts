import { describe, it, expect } from 'vitest';
import { 
  parseMathText, 
  hasLaTeXExpressions, 
  countMathExpressions, 
  extractMathContent 
} from './math-utils';

describe('Math Utilities', () => {
  describe('parseMathText', () => {
    it('parses plain text without math', () => {
      const result = parseMathText('This is plain text');
      expect(result).toEqual([
        { type: 'text', content: 'This is plain text' }
      ]);
    });

    it('parses inline math expressions', () => {
      const result = parseMathText('The equation is $x + 1 = 0$');
      expect(result).toEqual([
        { type: 'text', content: 'The equation is ' },
        { type: 'inline-math', content: 'x + 1 = 0' }
      ]);
    });

    it('parses block math expressions', () => {
      const result = parseMathText('The integral is $$\\int_0^1 x^2 dx$$');
      expect(result).toEqual([
        { type: 'text', content: 'The integral is ' },
        { type: 'block-math', content: '\\int_0^1 x^2 dx' }
      ]);
    });

    it('parses mixed text and math expressions', () => {
      const result = parseMathText('Given $x^2 + y^2 = 1$, solve for $y$ when $x = 0$');
      expect(result).toEqual([
        { type: 'text', content: 'Given ' },
        { type: 'inline-math', content: 'x^2 + y^2 = 1' },
        { type: 'text', content: ', solve for ' },
        { type: 'inline-math', content: 'y' },
        { type: 'text', content: ' when ' },
        { type: 'inline-math', content: 'x = 0' }
      ]);
    });

    it('parses complex expressions with fractions and symbols', () => {
      const result = parseMathText('The fraction $\\frac{a}{b}$ equals $$\\frac{\\sin(x)}{\\cos(x)} = \\tan(x)$$');
      expect(result).toEqual([
        { type: 'text', content: 'The fraction ' },
        { type: 'inline-math', content: '\\frac{a}{b}' },
        { type: 'text', content: ' equals ' },
        { type: 'block-math', content: '\\frac{\\sin(x)}{\\cos(x)} = \\tan(x)' }
      ]);
    });

    it('handles empty strings', () => {
      const result = parseMathText('');
      expect(result).toEqual([]);
    });

    it('handles malformed math expressions', () => {
      const result = parseMathText('This has $incomplete math');
      expect(result).toEqual([
        { type: 'text', content: 'This has $incomplete math' }
      ]);
    });
  });

  describe('hasLaTeXExpressions', () => {
    it('detects inline math expressions', () => {
      expect(hasLaTeXExpressions('The value is $x + 1$')).toBe(true);
    });

    it('detects block math expressions', () => {
      expect(hasLaTeXExpressions('The integral $$\\int x dx$$')).toBe(true);
    });

    it('returns false for plain text', () => {
      expect(hasLaTeXExpressions('This is plain text')).toBe(false);
    });

    it('returns false for incomplete expressions', () => {
      expect(hasLaTeXExpressions('This has $incomplete')).toBe(false);
    });

    it('handles empty strings', () => {
      expect(hasLaTeXExpressions('')).toBe(false);
    });
  });

  describe('countMathExpressions', () => {
    it('counts inline math expressions', () => {
      const result = countMathExpressions('Given $x = 1$ and $y = 2$');
      expect(result).toEqual({ inline: 2, block: 0 });
    });

    it('counts block math expressions', () => {
      const result = countMathExpressions('$$\\int x dx$$ and $$\\sum_{i=1}^n i$$');
      expect(result).toEqual({ inline: 0, block: 2 });
    });

    it('counts mixed expressions correctly', () => {
      const result = countMathExpressions('Given $x = 1$ we have $$\\int_0^1 x dx = \\frac{1}{2}$$');
      expect(result).toEqual({ inline: 1, block: 1 });
    });

    it('handles no math expressions', () => {
      const result = countMathExpressions('Plain text only');
      expect(result).toEqual({ inline: 0, block: 0 });
    });

    it('avoids double counting block expressions', () => {
      // Block expressions contain $$ which could be mistaken for inline
      const result = countMathExpressions('$$x^2 + y^2 = 1$$');
      expect(result).toEqual({ inline: 0, block: 1 });
    });
  });

  describe('extractMathContent', () => {
    it('extracts content from inline math', () => {
      const result = extractMathContent('The value $x + 1$ is important');
      expect(result).toEqual(['x + 1']);
    });

    it('extracts content from block math', () => {
      const result = extractMathContent('$$\\frac{a}{b} = c$$');
      expect(result).toEqual(['\\frac{a}{b} = c']);
    });

    it('extracts multiple expressions', () => {
      const result = extractMathContent('Given $a = 1$ and $$b = \\sqrt{2}$$');
      expect(result).toEqual(['a = 1', 'b = \\sqrt{2}']);
    });

    it('returns empty array for plain text', () => {
      const result = extractMathContent('No math here');
      expect(result).toEqual([]);
    });

    it('handles complex mathematical expressions', () => {
      const result = extractMathContent('$\\sum_{i=1}^{n} \\frac{1}{i^2} = \\frac{\\pi^2}{6}$');
      expect(result).toEqual(['\\sum_{i=1}^{n} \\frac{1}{i^2} = \\frac{\\pi^2}{6}']);
    });
  });

  describe('Edge Cases', () => {
    it('handles adjacent math expressions', () => {
      const result = parseMathText('When $a = 1$ and $b = 2$, then $c = 3$');
      expect(result).toEqual([
        { type: 'text', content: 'When ' },
        { type: 'inline-math', content: 'a = 1' },
        { type: 'text', content: ' and ' },
        { type: 'inline-math', content: 'b = 2' },
        { type: 'text', content: ', then ' },
        { type: 'inline-math', content: 'c = 3' }
      ]);
    });

    it('handles multiline expressions', () => {
      const text = `$$
        \\begin{align}
        x &= a + b \\\\
        y &= c + d
        \\end{align}
      $$`;
      const result = parseMathText(text);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('block-math');
      expect(result[0].content).toContain('\\begin{align}');
    });

    it('handles expressions with special characters', () => {
      const result = parseMathText('$\\alpha + \\beta \\neq \\gamma$');
      expect(result).toEqual([
        { type: 'inline-math', content: '\\alpha + \\beta \\neq \\gamma' }
      ]);
    });
  });
});