import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

import { pseudo } from '../pseudo.grammar';

/** each piece of a line of pseudo-code, with the scopes the grammar gives it beyond the language's own */
export const scopesOf = async (code: string): Promise<string[][]> => {
  const highlighter = await createHighlighterCore({
    engine: createJavaScriptRegexEngine(),
    langs: [
      pseudo,
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
