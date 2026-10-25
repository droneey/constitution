enum Level {
  May = 'MAY',
  Must = 'MUST',
  Should = 'SHOULD',
}

interface Rule {
  readonly level: Level;
  readonly slug: string;
  readonly tightens?: string;
}

const RULE_HEADING =
  /^([a-z0-9]+(?:-[a-z0-9]+)*)(?: → ([a-z0-9]+(?:-[a-z0-9]+)*))? · (MUST|SHOULD|MAY)$/;

const RULE_HEADING_MARK = '### ';

const levelsByText: ReadonlyMap<string | undefined, Level> = new Map(
  Object.values(Level).map((level) => [
    level,
    level,
  ]),
);

const ruleOf = (heading: string): Rule | undefined => {
  const match = RULE_HEADING.exec(heading);

  if (match === null) {
    return undefined;
  }

  const [, slug, tightens, level] = match;
  const known = levelsByText.get(level);

  const rule =
    // Stryker disable next-line ConditionalExpression,LogicalOperator: a match holds the slug and one of the levels, so the check only narrows their types
    slug === undefined || known === undefined
      ? undefined
      : {
          level: known,
          slug,
        };

  if (tightens === undefined) {
    return rule;
  }

  // Stryker disable next-line ConditionalExpression: a match always makes the rule, so its check only narrows the type
  return rule === undefined
    ? undefined
    : {
        ...rule,
        tightens,
      };
};

const slugsIn = (markdown: string): readonly string[] =>
  markdown.split('\n').flatMap((line) => {
    const rule = line.startsWith(RULE_HEADING_MARK)
      ? ruleOf(line.slice(RULE_HEADING_MARK.length))
      : undefined;

    return rule === undefined
      ? []
      : [
          rule.slug,
        ];
  });

const unknownExamplesOf = (
  examples: readonly string[],
  ruleSlugs: ReadonlySet<string>,
): readonly string[] => examples.filter((slug) => !ruleSlugs.has(slug));

const Rule = {
  of: ruleOf,
  slugsIn,
  unknownExamplesOf,
} as const;

export { Level, Rule };
