import { parseDocument } from 'yaml';

import type { VocabularyParser } from '../../domain/contracts';
import type { VocabularyRead } from '../../domain/entities';
import { vocabularyModel } from './models';

const parse = (yaml: string): VocabularyRead => {
  const document = parseDocument(yaml, {
    prettyErrors: false,
  });
  const [error] = document.errors;

  if (error !== undefined) {
    return {
      reason: error.message,
      status: 'not-yaml',
    };
  }

  const parsing = vocabularyModel.safeParse(document.toJS());

  return parsing.success
    ? {
        status: 'parsed',
        vocabulary: parsing.data,
      }
    : {
        issues: parsing.error.issues.map((issue) => ({
          field: issue.path.map(String).join('.'),
          message: issue.message,
        })),
        status: 'mismatched',
      };
};

const createYamlVocabularyParser = (): VocabularyParser => ({
  parse,
});

export { createYamlVocabularyParser };
