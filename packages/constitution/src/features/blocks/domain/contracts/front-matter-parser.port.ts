import type { FieldIssue, ReadStatus, SkillFrontMatterRead } from '../entities';

interface FrontMatterFields {
  readonly abstract: boolean;
  readonly extends: string | undefined;
  readonly governs: readonly string[];
  readonly id: string;
  readonly languages: readonly string[];
  readonly requires: readonly string[];
  readonly summary: string;
}

type FrontMatterRead =
  | {
      readonly line: number | undefined;
      readonly reason: string;
      readonly status: ReadStatus.NotYaml;
    }
  | {
      readonly status: ReadStatus.NotMapping;
    }
  | {
      readonly fields: FrontMatterFields | undefined;
      readonly issues: readonly FieldIssue[];
      readonly keys: readonly string[];
      readonly status: ReadStatus.Mapping;
    };

interface FrontMatterParser {
  readonly parse: (yaml: string) => FrontMatterRead;
  readonly skill: (yaml: string) => SkillFrontMatterRead;
}

export type { FrontMatterFields, FrontMatterParser, FrontMatterRead };
