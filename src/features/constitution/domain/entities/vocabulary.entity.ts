import type { FieldIssue } from './manifest.entity';

interface VocabularySection {
  concepts: readonly string[];
  folders: readonly string[];
  suffixes: readonly string[];
}

interface Vocabulary {
  architecture: VocabularySection;
  workflow: VocabularySection;
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

export type { Vocabulary, VocabularyRead, VocabularySection };
