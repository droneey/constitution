import type { FieldIssue, SkillFrontMatterRead } from '../entities';

interface FrontMatterFields {
  abstract: boolean;
  dictionary: readonly string[];
  extends: string | undefined;
  governs: readonly string[];
  id: string;
  languages: readonly string[];
  requires: readonly string[];
  summary: string;
}

// The fields a project reads from a block's card, each empty where the card leaves it out or
// gives it in another form.
interface BlockCard {
  extends: string | undefined;
  governs: readonly string[];
  isAbstract: boolean;
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
  card: (yaml: string) => BlockCard;
  parse: (yaml: string) => FrontMatterRead;
  skill: (yaml: string) => SkillFrontMatterRead;
}

export type { BlockCard, FrontMatterFields, FrontMatterParser, FrontMatterRead };
