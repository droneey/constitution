import type { FieldIssue } from './manifest.entity';

interface Vocabulary {
  architecture: {
    concepts: readonly string[];
    folders: readonly string[];
    suffixes: readonly string[];
  };
}

type VocabularyRead =
  | {
      status: 'parsed';
      vocabulary: Vocabulary;
    }
  | {
      reason: string;
      status: 'not-yaml';
    }
  | {
      issues: readonly FieldIssue[];
      status: 'mismatched';
    };

export type { Vocabulary, VocabularyRead };
