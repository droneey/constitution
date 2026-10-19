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

const titleOf = (markdown: string): string | undefined =>
  linesOf(markdown)
    .find((line) => line.startsWith('# '))
    ?.slice('# '.length);

/** still in Markdown */
const summaryLineOf = (markdown: string): string | undefined =>
  linesOf(markdown)
    .find((line) => line.startsWith('> '))
    ?.slice('> '.length);

const AXIS_FOLDERS: readonly string[] = [
  'foundation',
  'architecture',
  'workflow',
];

/** a passport is `<id>/<id>.md`; an axis folder has none */
const isPassportPath = (path: string): boolean => {
  const [name, folder] = path.split('/').toReversed();

  return !AXIS_FOLDERS.some((axis) => axis === folder) && name === `${folder}.md`;
};

const pageSlugsOf = (path: string): readonly string[] => {
  const parts = path.replace(/\.md$/, '').split('/');

  return isPassportPath(path) ? parts.slice(0, -1) : parts;
};

const unknownExamplesOf = (
  examples: readonly string[],
  rules: ReadonlySet<string>,
): readonly string[] => examples.filter((slug) => !rules.has(slug));

const slugsOfMarkdownAddress = (segments: readonly string[]): readonly string[] => {
  const slugs = segments.map((segment, index) =>
    index === segments.length - 1 ? segment.replace(/\.md$/, '') : segment,
  );

  return slugs.length === 1 && slugs[0] === 'index' ? [] : slugs;
};

export {
  AXIS_FOLDERS,
  isPassportPath,
  pageSlugsOf,
  ruleOf,
  ruleSlugsOf,
  slugsOfMarkdownAddress,
  summaryLineOf,
  titleOf,
  unknownExamplesOf,
};
