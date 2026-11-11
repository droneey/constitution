import type { LanguageRegistration } from 'shiki';

const numberMatch = String.raw`\b\d+(\.\d+)?\b`;
const keywordMatch = String.raw`\b(if|else|then|when|for|each|in|while|return|function|let|call|throw|try|catch|end|and|or|not|is|new|type|class|as|await|async|readonly|with|test|import|from|export|extends|override)\b`;
const languageConstantMatch = String.raw`\b(true|false|nothing)\b`;
const typeNameMatch = String.raw`\b[A-Z][A-Za-z0-9]*\b`;
const functionNameMatch = String.raw`\b[a-z][A-Za-z0-9]*(?=\()`;

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
      match: numberMatch,
      name: 'constant.numeric.pseudo',
    },
    {
      match: keywordMatch,
      name: 'keyword.control.pseudo',
    },
    {
      match: languageConstantMatch,
      name: 'constant.language.pseudo',
    },
    {
      match: typeNameMatch,
      name: 'entity.name.type.pseudo',
    },
    {
      match: functionNameMatch,
      name: 'entity.name.function.pseudo',
    },
  ],
} as const;

export { PSEUDO };
