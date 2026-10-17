enum Met {
  Yes = 'yes',
  Partly = 'partly',
  No = 'no',
}

interface RequirementAnswer {
  readonly block: string;
  readonly file: string;
  readonly how: string;
  readonly met: string;
  readonly requirement: string;
  readonly with: string | undefined;
}

export type { RequirementAnswer };
export { Met };
