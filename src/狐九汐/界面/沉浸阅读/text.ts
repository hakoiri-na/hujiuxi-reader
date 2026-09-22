export type Token =
  | { kind: 'text'; text: string }
  | { kind: 'term'; text: string; note: string }
  | { kind: 'quote'; children: Token[] }
  | { kind: 'dialogue'; ja: Token[]; zh: Token[] };
export function extractStory(message: string): string {
  return [...message.matchAll(/<gal\b[^>]*>([\s\S]*?)<\/gal>/gi)]
    .map(m => m[1].trim())
    .filter(Boolean)
    .join('\n\n');
}
export function tokenize(text: string, dialogue = true): Token[] {
  const pattern = dialogue ? /「([^「」]*)」|\{([^|{}]+)\|([^{}]+)\}/g : /\{([^|{}]+)\|([^{}]+)\}/g;
  const tokens: Token[] = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index! > last) tokens.push({ kind: 'text', text: text.slice(last, match.index) });
    if (dialogue && match[1] !== undefined) {
      // The bilingual separator must be outside a culture annotation.
      let depth = 0;
      const split = [...match[1]].findIndex(c => {
        if (c === '{') depth++;
        if (c === '}') depth--;
        return c === '|' && depth === 0;
      });
      if (split >= 0) {
        const chars = [...match[1]];
        tokens.push({
          kind: 'dialogue',
          ja: tokenize(chars.slice(0, split).join(''), false),
          zh: tokenize(chars.slice(split + 1).join(''), false),
        });
      } else tokens.push({ kind: 'quote', children: tokenize(match[1], false) });
    } else tokens.push({ kind: 'term', text: match[dialogue ? 2 : 1], note: match[dialogue ? 3 : 2] });
    last = match.index! + match[0].length;
  }
  if (last < text.length) tokens.push({ kind: 'text', text: text.slice(last) });
  return tokens;
}
export function collectTerms(source: string) {
  const seen = new Map<string, string>();
  for (const m of source.matchAll(/\{([^|{}]+)\|([^{}]+)\}/g)) seen.set(m[1], m[2]);
  return [...seen].map(([term, note]) => ({ term, note }));
}
