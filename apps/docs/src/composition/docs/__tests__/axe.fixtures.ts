import axe from 'axe-core';

const WCAG_LEVEL_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22a',
  'wcag22aa',
] as const;

// Why: a simulated document lays nothing out and paints nothing, so contrast is the token-pair
// test's.
const UNJUDGED_IN_SIMULATED_DOM = [
  'color-contrast',
] as const;

// Why: only a screen answers for the page's landmarks and the ways to skip past them.
const PAGE_RULES = [
  'bypass',
  'landmark-one-main',
  'landmark-unique',
  'region',
] as const;

interface AxeFinding {
  id: string;
  targets: string[];
}

const findingsOf = async (root: Element, disabled: readonly string[]): Promise<AxeFinding[]> => {
  const results = await axe.run(root, {
    rules: Object.fromEntries(
      disabled.map((id) => [
        id,
        {
          enabled: false,
        },
      ]),
    ),
    runOnly: {
      type: 'tag',
      values: [
        ...WCAG_LEVEL_TAGS,
      ],
    },
  });

  return results.violations.map((violation) => ({
    id: violation.id,
    targets: violation.nodes.map((node) => node.target.join(' ')),
  }));
};

const screenViolationsIn = (root: Element = document.body): Promise<AxeFinding[]> =>
  findingsOf(root, UNJUDGED_IN_SIMULATED_DOM);

const componentViolationsIn = (root: Element = document.body): Promise<AxeFinding[]> =>
  findingsOf(root, [
    ...UNJUDGED_IN_SIMULATED_DOM,
    ...PAGE_RULES,
  ]);

export { componentViolationsIn, screenViolationsIn };
