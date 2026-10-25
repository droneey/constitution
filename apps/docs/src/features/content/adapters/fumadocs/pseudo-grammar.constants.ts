import type { LanguageRegistration } from 'shiki';

const PSEUDO: LanguageRegistration = {
  name: 'pseudo',
  scopeName: 'source.pseudo',
  repository: {},
  patterns: [
    {
      match: '(#|//).*$',
      name: 'comment.line.pseudo',
    },
    {
      begin: '"',
      end: '"',
      name: 'string.quoted.double.pseudo',
    },
    {
      match: '\\b\\d+(\\.\\d+)?\\b',
      name: 'constant.numeric.pseudo',
    },
    {
      match:
        '\\b(if|else|then|when|for|each|in|while|return|function|let|call|throw|try|catch|end|and|or|not|is|new|type|class|as|await|async|readonly|with|test|import|from|export|extends|override)\\b',
      name: 'keyword.control.pseudo',
    },
    {
      match: '\\b(true|false|nothing)\\b',
      name: 'constant.language.pseudo',
    },
    {
      match: '\\b[A-Z][A-Za-z0-9]*\\b',
      name: 'entity.name.type.pseudo',
    },
    {
      match: '\\b[a-z][A-Za-z0-9]*(?=\\()',
      name: 'entity.name.function.pseudo',
    },
  ],
} as const;

export { PSEUDO };
