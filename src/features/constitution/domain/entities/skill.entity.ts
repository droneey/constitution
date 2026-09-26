type SkillFrontMatterRead =
  | {
      description: string | undefined;
      name: string | undefined;
      status: 'parsed';
    }
  | {
      reason: string;
      status: 'not-yaml';
    };

interface Skill {
  directory: string;
  // undefined when the file does not open with a front matter
  frontMatter: SkillFrontMatterRead | undefined;
  path: string;
}

export type { Skill, SkillFrontMatterRead };
