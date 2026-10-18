import type { Heading, Root, RootContent } from 'mdast';

import { headingTextOf, isHeading } from '../markdown';

interface SectionsOptions {
  /** the second-level sections the page leaves out, by the text of their headings */
  drop?: readonly string[];
  /** the one second-level section the page shows, without its heading */
  keep?: string;
}

/** a second-level section of a file, or what comes before the first one */
interface Section {
  body: RootContent[];
  heading: Heading | undefined;
}

const SECTION_DEPTH = 2;

const sectionsOf = (children: readonly RootContent[]): Section[] => {
  let current: Section = {
    body: [],
    heading: undefined,
  };
  const sections = [
    current,
  ];

  for (const node of children) {
    if (isHeading(node, SECTION_DEPTH)) {
      current = {
        body: [],
        heading: node,
      };
      sections.push(current);
    } else {
      current.body.push(node);
    }
  }

  return sections;
};

/** a page made of a part of a longer file, as the site splits the README into its first pages */
const remarkSections =
  ({ drop, keep }: SectionsOptions) =>
  (tree: Root): void => {
    const sections = sectionsOf(tree.children);

    tree.children =
      keep === undefined
        ? sections.flatMap(({ heading, body }) =>
            heading !== undefined && drop?.includes(headingTextOf(heading)) === true
              ? []
              : [
                  ...(heading
                    ? [
                        heading,
                      ]
                    : []),
                  ...body,
                ],
          )
        : (sections.find(({ heading }) => heading !== undefined && headingTextOf(heading) === keep)
            ?.body ?? []);
  };

export type { SectionsOptions };
export { remarkSections };
