type Files = Record<string, string>;

interface BlockFixture {
  abstract?: boolean;
  body: string;
  chapters?: readonly string[];
  checks?: readonly string[];
  extends?: string;
  id: string;
  kind: string;
  requires?: readonly string[];
  summary: string;
}

interface RuleFixture {
  check?: string;
  level?: string;
  slug: string;
  statement: string;
}

const SYNTHETIC_BLOCKS = 120;
const SYNTHETIC_RULES = 3;
const NUMBER_WIDTH = 3;

const list = (items: readonly string[] | undefined): string =>
  `[${(items ?? []).join(', ')}]`;

const mainFile = (block: BlockFixture): string =>
  [
    '---',
    `id: ${block.id}`,
    `kind: ${block.kind}`,
    `summary: ${block.summary}`,
    `chapters: ${list(block.chapters)}`,
    `requires: ${list(block.requires)}`,
    `extends: ${block.extends ?? 'null'}`,
    `abstract: ${String(block.abstract ?? false)}`,
    `checks: ${list(block.checks)}`,
    'owns: []',
    'governs: []',
    'status: stable',
    '---',
    '',
    block.body,
  ].join('\n');

const rule = (input: RuleFixture): string =>
  [
    `## ${input.slug} · ${input.level ?? 'MUST'}`,
    input.statement,
    '**Why:** it keeps the fixture honest.',
    `**Check:** ${input.check ?? 'review'}`,
    '**Tags:** architecture',
    '',
  ].join('\n');

const section = (title: string, rules: readonly RuleFixture[]): string =>
  `# ${title}\n\n${rules.map(rule).join('\n')}`;

// Core's part runs close to its 3,500 bytes, as the real one may.
const CORE_BODY = [
  '# Core',
  '',
  'Read this digest first, then the files of the blocks it names before you change code they govern.',
  '',
  'A project override is stronger than any rule; otherwise the more specific layer wins, and a block only tightens what is above it.',
  '',
  ...Array.from(
    {
      length: 28,
    },
    (_, index) =>
      `Paragraph ${String(index + 1).padStart(2, '0')} of core's part states one more principle in about one hundred and twenty bytes of text.`,
  ).flatMap((paragraph) => [
    paragraph,
    '',
  ]),
  rule({
    slug: 'rules-bind',
    statement: 'Every change follows the active rules.',
  }),
].join('\n');

const CORE_PART = `${CORE_BODY.trim()}\n\nLaws: dependencies-point-inward, names-reveal-intent.\n`;

const coreFiles = (): Files => ({
  'blocks/core/code.md': section('Code', [
    {
      check: 'tool — secrets',
      slug: 'no-secret-in-code',
      statement: 'No secret is written into the code.',
    },
  ]),
  'blocks/core/core.md': mainFile({
    body: CORE_BODY,
    chapters: [
      'principles.md',
      'code.md',
    ],
    id: 'core',
    kind: 'core',
    summary: 'The laws for any program.',
  }),
  'blocks/core/principles.md': section('Principles', [
    {
      slug: 'dependencies-point-inward',
      statement: 'Dependencies point inward.',
    },
    {
      slug: 'names-reveal-intent',
      statement: 'A name says what a thing is for.',
    },
  ]),
});

const domain = (input: {
  chapters?: readonly string[];
  id: string;
  rules: readonly RuleFixture[];
  summary: string;
}): Files => ({
  [`blocks/domains/${input.id}/${input.id}.md`]: mainFile({
    body: section(input.id, input.rules),
    chapters: input.chapters ?? [],
    id: input.id,
    kind: 'domain',
    summary: input.summary,
  }),
});

const domainFiles = (): Files => ({
  ...domain({
    chapters: [
      'forms.md',
    ],
    id: 'ui',
    rules: [
      {
        check: 'test',
        slug: 'four-data-states',
        statement: 'Every data view shows loading, empty, error and content.',
      },
    ],
    summary: 'Screens and what a user sees on them.',
  }),
  'blocks/domains/ui/forms.md': section('Forms', [
    {
      slug: 'labels-on-fields',
      statement: 'Every field has a visible label.',
    },
  ]),
  'blocks/domains/ui/with/remote-data.md': section('UI with remote data', [
    {
      slug: 'optimistic-writes-roll-back',
      statement: 'An optimistic write rolls back when the server refuses it.',
    },
  ]),
  ...domain({
    id: 'remote-data',
    rules: [
      {
        slug: 'reads-are-cancellable',
        statement: 'A read of remote data can be cancelled.',
      },
    ],
    summary: 'Data another system owns.',
  }),
  ...domain({
    id: 'untrusted-client',
    rules: [
      {
        slug: 'no-secret-in-the-client',
        statement: 'The client holds no secret.',
      },
    ],
    summary: 'Code on a machine the user controls.',
  }),
  ...domain({
    id: 'unreliable-network',
    rules: [
      {
        slug: 'retries-back-off',
        statement: 'A retry waits longer each time.',
      },
    ],
    summary: 'A network that drops and delays.',
  }),
  ...domain({
    id: 'analytics',
    rules: [
      {
        slug: 'analytics-consent-first',
        statement: 'Nothing is tracked before the user consents.',
      },
    ],
    summary: 'Measuring how the product is used.',
  }),
  ...domain({
    id: 'version-control',
    rules: [
      {
        slug: 'commits-are-atomic',
        statement: 'A commit holds one change.',
      },
      {
        level: 'SHOULD',
        slug: 'branch-per-change',
        statement: 'A change lives on its own branch.',
      },
    ],
    summary: 'History of the code.',
  }),
  ...domain({
    id: 'i18n',
    rules: [
      {
        slug: 'plurals-by-cldr',
        statement: 'Plural forms follow CLDR.',
      },
    ],
    summary: 'Text in the user language.',
  }),
});

const contextFiles = (): Files => ({
  'blocks/contexts/languages/typescript/typescript.md': mainFile({
    body: section('TypeScript', [
      {
        check: 'tool — types',
        slug: 'no-any',
        statement: 'A value is never typed `any`.',
      },
    ]),
    checks: [
      'types',
    ],
    id: 'typescript',
    kind: 'context',
    summary: 'Code written in TypeScript.',
  }),
  'blocks/contexts/languages/python/python.md': mainFile({
    body: section('Python', [
      {
        check: 'tool — lint',
        slug: 'no-bare-except',
        statement: 'An except clause names what it catches.',
      },
    ]),
    id: 'python',
    kind: 'context',
    summary: 'Code written in Python.',
  }),
  'blocks/contexts/platforms/browser/browser.md': mainFile({
    body: section('Browser', [
      {
        slug: 'no-window-during-render',
        statement: 'Rendering never reads the window.',
      },
    ]),
    id: 'browser',
    kind: 'context',
    requires: [
      'untrusted-client',
      'unreliable-network',
    ],
    summary: 'Code that runs in a browser tab.',
  }),
  'blocks/contexts/platforms/cli/cli.md': mainFile({
    body: section('CLI', [
      {
        slug: 'exit-codes-are-documented',
        statement: 'Every exit code is documented.',
      },
    ]),
    id: 'cli',
    kind: 'context',
    requires: [
      'untrusted-client',
    ],
    summary: 'A program run from a terminal.',
  }),
});

const implementation = (input: {
  abstract?: boolean;
  body?: string;
  checks?: readonly string[];
  extends?: string;
  id: string;
  requires: readonly string[];
  rules?: readonly RuleFixture[];
  summary: string;
}): Files => ({
  [`blocks/implementations/${input.id}/${input.id}.md`]: mainFile({
    ...input,
    body: `${section(input.id, input.rules ?? [])}${input.body ?? ''}`,
    kind: 'implementation',
  }),
});

const implementationFiles = (): Files => ({
  ...implementation({
    abstract: true,
    checks: [
      'lint',
    ],
    id: '_lint-base',
    requires: [
      'typescript',
    ],
    summary: 'What every TypeScript linter shares.',
  }),
  ...implementation({
    checks: [
      'lint',
    ],
    id: 'markdownlint',
    requires: [],
    summary: 'Lints Markdown, which is no language block.',
  }),
  ...implementation({
    checks: [
      'lint',
    ],
    id: 'ruff',
    requires: [
      'python',
    ],
    summary: 'Lints Python.',
  }),
  ...implementation({
    abstract: true,
    id: '_react',
    requires: [
      'ui',
    ],
    rules: [
      {
        check: 'tool — lint',
        slug: 'hooks-at-top-level',
        statement: 'A hook is called only at the top level.',
      },
    ],
    summary: 'React as every renderer shares it.',
  }),
  ...implementation({
    extends: '_react',
    id: 'react-dom',
    requires: [
      'browser',
    ],
    rules: [
      {
        slug: 'portals-for-overlays',
        statement: 'An overlay renders through a portal.',
      },
    ],
    summary: 'React in the browser.',
  }),
  ...implementation({
    id: 'tanstack-query',
    requires: [
      '_react',
      'remote-data',
    ],
    rules: [
      {
        slug: 'query-keys-are-arrays',
        statement: 'A query key is an array.',
      },
    ],
    summary: 'Server state in React.',
  }),
  ...implementation({
    checks: [
      'format',
      'lint',
    ],
    id: 'biome',
    requires: [
      'typescript',
    ],
    summary: 'Formats and lints TypeScript.',
  }),
  ...implementation({
    id: 'bun',
    requires: [
      'typescript',
    ],
    rules: [
      {
        slug: 'lockfile-committed',
        statement: 'The lockfile is committed.',
      },
    ],
    summary: 'The runtime and package manager.',
  }),
  ...implementation({
    id: 'git',
    requires: [
      'version-control',
    ],
    rules: [
      {
        slug: 'tags-are-annotated',
        statement: 'A release tag is annotated.',
      },
    ],
    summary: 'Git as the version control.',
  }),
  ...implementation({
    extends: 'git',
    id: 'lefthook',
    requires: [],
    rules: [
      {
        slug: 'hooks-run-the-check',
        statement: 'The pre-push hook runs the check.',
      },
    ],
    summary: 'Git hooks.',
  }),
  ...implementation({
    checks: [
      'secrets',
    ],
    id: 'gitleaks',
    requires: [
      'version-control',
    ],
    summary: 'Finds secrets in commits.',
  }),
  ...implementation({
    body: [
      '',
      '## Requirements',
      '',
      '| Requirement | How | Status |',
      '|---|---|---|',
      '| `analytics-consent-first` | tracks from the first page view | not met |',
      '',
    ].join('\n'),
    id: 'matomo',
    requires: [
      'analytics',
    ],
    rules: [
      {
        slug: 'site-id-from-config',
        statement: 'The site id comes from configuration.',
      },
    ],
    summary: 'Matomo web analytics.',
  }),
});

const syntheticId = (index: number): string =>
  `synthetic-${String(index).padStart(NUMBER_WIDTH, '0')}`;

// Summaries of 70 bytes and long headlines make the budget bite.
const syntheticFiles = (): Files =>
  Object.assign(
    {},
    ...Array.from(
      {
        length: SYNTHETIC_BLOCKS,
      },
      (_, index) => {
        const id = syntheticId(index + 1);

        return domain({
          id,
          rules: Array.from(
            {
              length: SYNTHETIC_RULES,
            },
            (__, position) => ({
              slug: `${id}-rule-${position + 1}`,
              statement: `The ${id} rule number ${position + 1} holds for every file, and its headline is long enough to weigh on the byte budget.`,
            }),
          ),
          summary: `Block ${id} pads the digest to prove its byte budget holds up.`,
        });
      },
    ),
  );

const constitutionFiles = (): Files => ({
  ...coreFiles(),
  ...domainFiles(),
  ...contextFiles(),
  ...implementationFiles(),
  ...syntheticFiles(),
});

export type { Files };
export { CORE_PART, constitutionFiles, syntheticId };
