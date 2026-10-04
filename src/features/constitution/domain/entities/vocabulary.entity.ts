import type { FieldIssue } from './manifest.entity';

interface VocabularySection {
  readonly concepts: readonly string[];
  readonly folders: readonly string[];
  readonly suffixes: readonly string[];
}

interface Vocabulary {
  readonly architecture: VocabularySection;
  readonly workflow: VocabularySection;
}

type VocabularyRead =
  | {
      readonly status: 'parsed';
      readonly vocabulary: Vocabulary;
    }
  | {
      readonly reason: string;
      readonly status: 'not-yaml';
    }
  | {
      readonly issues: readonly FieldIssue[];
      readonly status: 'mismatched';
    };

export type { Vocabulary, VocabularyRead, VocabularySection };
