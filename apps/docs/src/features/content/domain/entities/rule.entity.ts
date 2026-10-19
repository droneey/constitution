export enum Level {
  May = 'MAY',
  Must = 'MUST',
  Should = 'SHOULD',
}

export interface Rule {
  level: Level;
  /** the rule it tightens */
  parent: string | undefined;
  slug: string;
}
