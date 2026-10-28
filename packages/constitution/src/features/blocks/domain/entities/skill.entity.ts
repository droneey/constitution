import type { TreePath } from '../value-objects';
import type { ReadStatus } from './document-read.entity';

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

export type { Agent, Skill, SkillFrontMatterRead };
export { SkillField };
