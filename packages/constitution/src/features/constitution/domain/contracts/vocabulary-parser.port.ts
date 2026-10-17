import type { VocabularyRead } from '../entities';

interface VocabularyParser {
  parse: (yaml: string) => VocabularyRead;
}

export type { VocabularyParser };
