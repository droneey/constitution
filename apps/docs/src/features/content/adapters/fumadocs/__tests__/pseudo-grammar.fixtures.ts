import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

import { PSEUDO } from '../pseudo-grammar.constants';

/** only the scopes beyond the language's own */
export const scopesOf = async (code: string): Promise<string[][]> => {
  const highlighter = await createHighlighterCore({
    engine: createJavaScriptRegexEngine(),
    langs: [
      PSEUDO,
    ],
    themes: [
      {
        bg: '#ffffff',
        fg: '#000000',
        name: 'plain',
        settings: [],
        type: 'light',
      },
    ],
  });

  return highlighter
    .codeToTokensBase(code, {
      includeExplanation: 'scopeName',
      lang: 'pseudo',
      theme: 'plain',
    })
    .flatMap((line) =>
      line.flatMap((token) =>
        (token.explanation ?? []).map((piece) => [
          piece.content,
          ...piece.scopes.map((scope) => scope.scopeName),
        ]),
      ),
    );
};
