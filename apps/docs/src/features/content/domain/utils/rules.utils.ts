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

/** the folder of the platforms' and the languages' blocks, which the site's addresses leave out */
const CONTEXTS = 'contexts';

/** whether a block's file is its card, `<id>/<id>.md` */
const isCardPath = (path: string): boolean => {
  const parts = path.split('/');

  return parts.at(-1) === `${parts.at(-2)}.md`;
};

/** the slugs of a block's file: a card, `<id>/<id>.md`, is its folder's page; a chapter keeps its name; a context sits beside the other layers */
const pageSlugsOf = (path: string): readonly string[] => {
  const parts = path.replace(/\.md$/, '').split('/');
  const slugs = isCardPath(path) ? parts.slice(0, -1) : parts;

  return slugs[0] === CONTEXTS ? slugs.slice(1) : slugs;
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
  isCardPath,
  pageSlugsOf,
  ruleOf,
  ruleSlugsOf,
  slugsOfMarkdownAddress,
  summaryLineOf,
  titleOf,
  unknownExamplesOf,
};
