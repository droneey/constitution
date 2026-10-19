import type { PhrasingContent, RootContent } from 'mdast';

import { span, text } from './mdast.fixtures';

/** the mark before a rule's slug: its letter, and its level for a screen reader */
export const markOf = (input: { letter: string; level: string; mark: string }): PhrasingContent =>
  span(
    {
      'data-rule-mark': input.mark,
    },
    [
      span(
        {
          'data-rule-mark-letter': '',
        },
        [
          text(input.letter),
        ],
      ),
      span(
        {
          className: [
            'sr-only',
          ],
        },
        [
          text(input.level),
        ],
      ),
    ],
  );

/** a rule's heading as the plugin renders it */
export const headingOf = (children: PhrasingContent[]): RootContent => ({
  children,
  data: {
    hProperties: {
      'data-rule': '',
    },
  },
  depth: 3,
  type: 'heading',
});

/** the line of a rule's tags, closing its card */
/** the line under a rule's heading that names the rule it tightens */
export const parentLineOf = (children: PhrasingContent[]): RootContent => ({
  children,
  data: {
    hProperties: {
      'data-rule-parent': '',
    },
  },
  type: 'paragraph',
});

export const metaOf = (children: PhrasingContent[]): RootContent => ({
  children,
  data: {
    hProperties: {
      'data-rule-meta': '',
    },
  },
  type: 'paragraph',
});

/** a rule's why, under its label */
export const whyOf = (children: PhrasingContent[]): RootContent => ({
  children: [
    span(
      {
        'data-rule-why-label': '',
      },
      [
        text('Why'),
      ],
    ),
    ...children,
  ],
  data: {
    hProperties: {
      'data-rule-why': '',
    },
  },
  type: 'paragraph',
});

/** a rule's card */
export const cardOf = (children: RootContent[]): RootContent => ({
  children,
  data: {
    hName: 'section',
    hProperties: {
      'data-rule-card': '',
    },
  },
  type: 'ruleCard',
});

/** a part of an example, a `div` marked by its attributes */
export const boxOf = (
  attributes: Readonly<Record<string, string>>,
  children: RootContent[],
): RootContent => ({
  children,
  data: {
    hName: 'div',
    hProperties: {
      ...attributes,
    },
  },
  type: 'box',
});
