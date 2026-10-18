/** how hard a rule binds */
export enum Level {
  May = 'MAY',
  Must = 'MUST',
  Should = 'SHOULD',
}

/** a rule's heading: its slug, its level, and the rule it tightens when it names one */
export interface Rule {
  level: Level;
  parent: string | undefined;
  slug: string;
}
