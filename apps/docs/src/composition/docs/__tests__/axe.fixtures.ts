import axe from 'axe-core';

const WCAG_A_AA = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22a',
  'wcag22aa',
];

/** a simulated document lays nothing out and paints nothing, so contrast is the token-pair test's */
const UNJUDGED_IN_A_SIMULATED_DOM = [
  'color-contrast',
];

/** only a screen answers for the page's landmarks and the ways to skip past them */
const PAGE_RULES = [
  'bypass',
  'landmark-one-main',
  'landmark-unique',
  'region',
];

interface AxeFinding {
  id: string;
  targets: string[];
}

const findingsOf = async (root: Element, disabled: string[]): Promise<AxeFinding[]> => {
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
      values: WCAG_A_AA,
    },
  });

  return results.violations.map((violation) => ({
    id: violation.id,
    targets: violation.nodes.map((node) => node.target.join(' ')),
  }));
};

const screenViolationsIn = (root: Element = document.body): Promise<AxeFinding[]> =>
  findingsOf(root, UNJUDGED_IN_A_SIMULATED_DOM);

/** a component owns no landmark of the page */
const componentViolationsIn = (root: Element = document.body): Promise<AxeFinding[]> =>
  findingsOf(root, [
    ...UNJUDGED_IN_A_SIMULATED_DOM,
    ...PAGE_RULES,
  ]);

export { componentViolationsIn, screenViolationsIn };
