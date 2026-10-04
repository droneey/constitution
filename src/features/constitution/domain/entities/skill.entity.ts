type SkillFrontMatterRead =
  | {
      readonly description: string | undefined;
      readonly name: string | undefined;
      readonly status: 'parsed';
    }
  | {
      readonly reason: string;
      readonly status: 'not-yaml';
    };

interface Skill {
  readonly directory: string;
  // undefined when the file does not open with a front matter
  readonly frontMatter: SkillFrontMatterRead | undefined;
  readonly path: string;
}

interface Agent {
  readonly file: string;
  readonly frontMatter: SkillFrontMatterRead | undefined;
  readonly path: string;
}

export type { Agent, Skill, SkillFrontMatterRead };
