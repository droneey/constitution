import type { ReadStatus } from './document-read.entity';

/** The fields the front matter of a skill or an agent declares. */
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
  /** absent when the file does not open with a front matter */
  readonly frontMatter?: SkillFrontMatterRead;
  readonly path: string;
}

interface Agent {
  readonly file: string;
  /** absent when the file does not open with a front matter */
  readonly frontMatter?: SkillFrontMatterRead;
  readonly path: string;
}

export type { Agent, Skill, SkillFrontMatterRead };
export { SkillField };
