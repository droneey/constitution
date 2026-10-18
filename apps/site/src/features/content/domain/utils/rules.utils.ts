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

/** the slugs of every rule a block's file holds */
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

/** the slugs of a block's file: a card, `<id>/<id>.md`, is its folder's page; a chapter keeps its name */
const pageSlugsOf = (path: string): readonly string[] => {
  const parts = path.replace(/\.md$/, '').split('/');

  return parts.at(-1) === parts.at(-2) ? parts.slice(0, -1) : parts;
};

/** the examples whose names are no rule's slug */
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
  pageSlugsOf,
  ruleOf,
  ruleSlugsOf,
  slugsOfMarkdownAddress,
  summaryLineOf,
  titleOf,
  unknownExamplesOf,
};
