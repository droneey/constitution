import axe from 'axe-core';

const WCAG_LEVEL_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22a',
  'wcag22aa',
] as const;

/**
 * a simulated document lays nothing out and paints nothing, so contrast is the token-pair test's,
 * and only a page answers for its landmarks and the ways to skip past them
 */
const UNJUDGED_IN_A_COMPONENT = [
  'bypass',
  'color-contrast',
  'landmark-one-main',
  'landmark-unique',
  'region',
] as const;

interface AxeFinding {
  readonly id: string;
  readonly targets: readonly string[];
}

/** what axe finds against WCAG A and AA in what a component draws */
const componentViolationsIn = async (root: Element = document.body): Promise<AxeFinding[]> => {
  const results = await axe.run(root, {
    rules: Object.fromEntries(
      UNJUDGED_IN_A_COMPONENT.map((id) => [
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

export { componentViolationsIn };
