enum Met {
  Yes = 'yes',
  Partly = 'partly',
  No = 'no',
}

interface RequirementAnswer {
  block: string;
  file: string;
  how: string;
  met: string;
  requirement: string;
  with: string | undefined;
}

export type { RequirementAnswer };
export { Met };
