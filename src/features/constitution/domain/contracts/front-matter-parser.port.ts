import type { FieldIssue, SkillFrontMatterRead } from '../entities';

interface FrontMatterFields {
  abstract: boolean;
  checks: readonly string[];
  dictionary: readonly string[];
  extends: string | undefined;
  governs: readonly string[];
  id: string;
  requires: readonly string[];
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
  skill: (yaml: string) => SkillFrontMatterRead;
}

export type { FrontMatterFields, FrontMatterParser, FrontMatterRead };
