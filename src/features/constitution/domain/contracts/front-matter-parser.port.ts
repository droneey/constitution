import type { FieldIssue } from '../entities';

interface FrontMatterFields {
  abstract: boolean;
  chapters: readonly string[];
  checks: readonly string[];
  extends: string | null;
  governs: readonly string[];
  id: string;
  kind: string;
  owns: readonly string[];
  requires: readonly string[];
  status: string;
  summary: string;
}

type FrontMatterRead =
  | {
      line: number | undefined;
      reason: string;
      status: 'not-yaml';
    }
  | {
      status: 'not-a-mapping';
    }
  | {
      fields: FrontMatterFields | undefined;
      issues: readonly FieldIssue[];
      keys: readonly string[];
      status: 'mapping';
    };

interface FrontMatterParser {
  parse: (yaml: string) => FrontMatterRead;
}

export type { FrontMatterFields, FrontMatterParser, FrontMatterRead };
