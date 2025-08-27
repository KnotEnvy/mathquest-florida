// Math utility functions for parsing and rendering LaTeX expressions

export function parseMathText(text: string): Array<{ type: 'text' | 'inline-math' | 'block-math', content: string }> {
  // Split text by math expressions (enclosed in $ or $$)
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/);
  
  return parts
    .filter(part => part.length > 0) // Remove empty strings
    .map(part => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        return { type: 'block-math' as const, content: part.slice(2, -2) };
      } else if (part.startsWith('$') && part.endsWith('$')) {
        return { type: 'inline-math' as const, content: part.slice(1, -1) };
      } else {
        return { type: 'text' as const, content: part };
      }
    });
}

export function hasLaTeXExpressions(text: string): boolean {
  return /\$\$[\s\S]*?\$\$|\$[\s\S]*?\$/.test(text);
}

export function countMathExpressions(text: string): { inline: number; block: number } {
  const blockMatches = text.match(/\$\$[\s\S]*?\$\$/g) || [];
  const inlineMatches = text.match(/\$[\s\S]*?\$/g) || [];
  
  // Remove block matches from inline count to avoid double counting
  const pureInlineMatches = inlineMatches.filter(match => !match.startsWith('$$'));
  
  return {
    inline: pureInlineMatches.length,
    block: blockMatches.length
  };
}

export function extractMathContent(text: string): string[] {
  const matches = text.match(/\$\$?([\s\S]*?)\$\$?/g) || [];
  return matches.map(match => {
    if (match.startsWith('$$')) {
      return match.slice(2, -2);
    } else {
      return match.slice(1, -1);
    }
  });
}