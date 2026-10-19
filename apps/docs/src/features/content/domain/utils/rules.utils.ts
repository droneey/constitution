import type { Rule } from '../entities';
import { Level } from '../entities';

const RULE_HEADING =
  /^([a-z0-9]+(?:-[a-z0-9]+)*)(?: → ([a-z0-9]+(?:-[a-z0-9]+)*))? · (MUST|SHOULD|MAY)$/;

const LEVELS: ReadonlyMap<string | undefined, Level> = new Map(
  Object.values(Level).map((level) => [
    level,
    level,
  ]),
);

/** the rule a third-level heading's text names */
const ruleOf = (text: string): Rule | undefined => {
  const match = RULE_HEADING.exec(text);

  if (match === null) {
    return undefined;
  }
  const [, slug, parent, level] = match;
  const known = LEVELS.get(level);

  // Stryker disable next-line ConditionalExpression,LogicalOperator: a match holds the slug and one of the levels, so the check only narrows their types
  return slug === undefined || known === undefined
    ? undefined
    : {
        level: known,
        parent,
        slug,
      };
};

const linesOf = (markdown: string): readonly string[] => markdown.split('\n');

const ruleSlugsOf = (markdown: string): readonly string[] =>
  linesOf(markdown).flatMap((line) => {
    const rule = line.startsWith('### ') ? ruleOf(line.slice('### '.length)) : undefined;

    return rule === undefined
      ? []
      : [
          rule.slug,
        ];
  });

/** the text of a file's first-level heading */
const titleOf = (markdown: string): string | undefined =>
  linesOf(markdown)
    .find((line) => line.startsWith('# '))
    ?.slice('# '.length);

/** the first line of a file's quote, still in Markdown */
const summaryLineOf = (markdown: string): string | undefined =>
  linesOf(markdown)
    .find((line) => line.startsWith('> '))
    ?.slice('> '.length);

/** the folders of a block's optional axes, each holding the axis's main chapter, `<axis>/<id>.md` */
const AXIS_FOLDERS: readonly string[] = [
  'architecture',
  'workflow',
];

/** whether a block's file is the main file of its folder: the block's card, `<id>/<id>.md`, or an axis's main chapter, `<id>/<axis>/<id>.md` */
const isMainFilePath = (path: string): boolean => {
  const [name, folder, above] = path.split('/').toReversed();
  const owner = AXIS_FOLDERS.some((axis) => axis === folder) ? above : folder;

  return name === `${owner}.md`;
};

/** the slugs of a block's file: a main file is its folder's page; a chapter keeps its name */
const pageSlugsOf = (path: string): readonly string[] => {
  const parts = path.replace(/\.md$/, '').split('/');

  return isMainFilePath(path) ? parts.slice(0, -1) : parts;
};

const unknownExamplesOf = (
  examples: readonly string[],
  rules: ReadonlySet<string>,
): readonly string[] => examples.filter((slug) => !rules.has(slug));

/** the slugs of a page from the segments of its Markdown address, `<slugs>.md` */
const slugsOfMarkdownAddress = (segments: readonly string[]): readonly string[] => {
  const slugs = segments.map((segment, index) =>
    index === segments.length - 1 ? segment.replace(/\.md$/, '') : segment,
  );

  return slugs.length === 1 && slugs[0] === 'index' ? [] : slugs;
};

export {
  isMainFilePath,
  pageSlugsOf,
  ruleOf,
  ruleSlugsOf,
  slugsOfMarkdownAddress,
  summaryLineOf,
  titleOf,
  unknownExamplesOf,
};
