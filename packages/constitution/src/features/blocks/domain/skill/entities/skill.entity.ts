import { SKILL_FILE_NAME } from '../../shared/constants';
import type { ReadStatus } from '../../shared/entities';
import type { TreePath } from '../../shared/value-objects';

enum SkillField {
  Name = 'name',
  Description = 'description',
}

type SkillFrontMatterRead =
  | {
      readonly description?: string;
      readonly name?: string;
      readonly status: ReadStatus.Parsed;
    }
  | {
      readonly reason: string;
      readonly status: ReadStatus.NotYaml;
    };

interface Skill {
  readonly directory: string;
  readonly frontMatter?: SkillFrontMatterRead;
  readonly path: TreePath;
}

interface Agent {
  readonly file: string;
  readonly frontMatter?: SkillFrontMatterRead;
  readonly path: TreePath;
}

// Why: Claude Code reads a skill at <directory>/<skill>/SKILL.md, where no folder is hidden.
const skillPath = new RegExp(
  `^((?:[^./][^/]*\\/)+)[^./][^/]*\\/${RegExp.escape(SKILL_FILE_NAME)}$`,
);
const AGENT_FILE = /^agents\/([^./][^/]*)\.md$/;

const directoryOf = (path: TreePath): string | undefined => skillPath.exec(path)?.[1];

const Skill = {
  directoryOf,
} as const;

const fileOf = (path: TreePath): string | undefined => AGENT_FILE.exec(path)?.[1];

const Agent = {
  fileOf,
} as const;

export type { SkillFrontMatterRead };
export { Agent, Skill, SkillField };
