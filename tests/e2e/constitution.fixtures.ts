import { Axis } from '#/kernel';

type Files = Record<string, string>;

interface BlockFixture {
  abstract?: boolean;
  body: string;
  extends?: string;
  governs?: readonly string[];
  id: string;
  languages?: readonly string[];
  requires?: readonly string[];
  summary: string;
}

interface RuleFixture {
  level?: string;
  parent?: string;
  slug: string;
  statement: string;
}

const SYNTHETIC_BLOCKS = 120;
const SYNTHETIC_RULES = 3;
const NUMBER_WIDTH = 3;

const list = (items: readonly string[] | undefined): string => `[${(items ?? []).join(', ')}]`;

const mainFile = (block: BlockFixture): string =>
  [
    '---',
    `id: ${block.id}`,
    `summary: ${block.summary}`,
    `requires: ${list(block.requires)}`,
    `extends: ${block.extends ?? 'null'}`,
    `abstract: ${String(block.abstract ?? false)}`,
    `languages: ${list(block.languages)}`,
    'dictionary: []',
    `governs: [${(block.governs ?? []).map((glob) => JSON.stringify(glob)).join(', ')}]`,
    '---',
    '',
    block.body,
  ].join('\n');

const headingOf = (input: RuleFixture): string =>
  input.parent === undefined
    ? `### ${input.slug} · ${input.level ?? 'MUST'}`
    : `### ${input.slug} → ${input.parent}${input.level === undefined ? '' : ` · ${input.level}`}`;

const rule = (input: RuleFixture): string =>
  [
    headingOf(input),
    input.statement,
    '',
    '| Why | Tags |',
    '|---|---|',
    '| it keeps the fixture honest. | [] |',
    '',
  ].join('\n');

const section = (input: { rules: readonly RuleFixture[]; title: string }): string =>
  `# ${input.title}\n\n${input.rules.map(rule).join('\n')}`;

const blockFiles = (
  input: BlockFixture & {
    dir: string;
    files?: Readonly<Files>;
  },
): Files => {
  const { dir, files = {}, ...card } = input;

  return {
    [`${dir}/${input.id}.md`]: mainFile(card),
    ...Object.fromEntries(
      Object.entries(files).map(([path, text]) => [
        `${dir}/${path}`,
        text,
      ]),
    ),
  };
};

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
].join('\n');

const CORE_PART = `${CORE_BODY.trim()}\n`;

const coreFiles = (): Files =>
  blockFiles({
    body: CORE_BODY,
    dir: 'blocks/core',
    files: {
      'foundation/principles.md': section({
        rules: [
          {
            slug: 'names-reveal-intent',
            statement: 'A name says what a thing is for.',
          },
          {
            level: 'SHOULD',
            slug: 'names-are-short',
            statement: 'A name is as short as its meaning allows.',
          },
        ],
        title: 'Principles',
      }),
      'foundation/code.md': section({
        rules: [
          {
            slug: 'no-secret-in-code',
            statement: 'No secret is written into the code.',
          },
        ],
        title: 'Code',
      }),
      'architecture/principles.md': section({
        rules: [
          {
            slug: 'dependencies-point-inward',
            statement: 'Dependencies point inward.',
          },
        ],
        title: 'Principles',
      }),
      'workflow/delivery.md': section({
        rules: [
          {
            slug: 'rules-bind',
            statement: 'Every change follows the active rules.',
          },
        ],
        title: 'Delivery',
      }),
    },
    id: 'core',
    summary: 'The laws for any program.',
  });

const rulesFile = (input: { axis?: Axis; id: string; rules: readonly RuleFixture[] }): Files => ({
  [`${input.axis ?? Axis.Foundation}/${input.id}.md`]: section({
    rules: input.rules,
    title: input.id,
  }),
});

const domain = (input: {
  axis?: Axis;
  files?: Readonly<Files>;
  governs?: readonly string[];
  id: string;
  rules: readonly RuleFixture[];
  summary: string;
}): Files =>
  blockFiles({
    body: `# ${input.id}\n`,
    dir: `blocks/domains/${input.id}`,
    files: {
      ...rulesFile(input),
      ...input.files,
    },
    ...(input.governs === undefined
      ? {}
      : {
          governs: input.governs,
        }),
    id: input.id,
    summary: input.summary,
  });

const domainFiles = (): Files => ({
  ...domain({
    files: {
      'architecture/forms.md': section({
        rules: [
          {
            slug: 'labels-on-fields',
            statement: 'Every field has a visible label.',
          },
        ],
        title: 'Forms',
      }),
      'architecture/with/remote-data.md': section({
        rules: [
          {
            slug: 'optimistic-writes-roll-back',
            statement: 'An optimistic write rolls back when the server refuses it.',
          },
        ],
        title: 'UI with remote data',
      }),
    },
    governs: [
      '**/ui/**',
      '**/components/**',
      'styles/*.{css,scss}',
    ],
    id: 'ui',
    rules: [
      {
        slug: 'four-data-states',
        statement: 'Every data view shows loading, empty, error and content.',
      },
      {
        parent: 'four-data-states',
        slug: 'loading-state-shown',
        statement: 'A view shows that it loads.',
      },
      {
        parent: 'loading-state-shown',
        slug: 'skeleton-matches-content',
        statement: 'A skeleton has the shape of its content.',
      },
      {
        level: 'MUST',
        parent: 'four-data-states',
        slug: 'error-state-offers-retry',
        statement: 'An error state offers a retry.',
      },
    ],
    summary: 'Screens and what a user sees on them.',
  }),
  ...domain({
    axis: Axis.Architecture,
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
    axis: Axis.Workflow,
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

enum ContextFolder {
  Languages = 'languages',
  Platforms = 'platforms',
}

const context = (input: {
  axis?: Axis;
  folder: ContextFolder;
  id: string;
  requires?: readonly string[];
  rules: readonly RuleFixture[];
  summary: string;
  title: string;
}): Files =>
  blockFiles({
    body: `# ${input.title}\n`,
    dir: `blocks/contexts/${input.folder}/${input.id}`,
    files: rulesFile(input),
    id: input.id,
    ...(input.requires === undefined
      ? {}
      : {
          requires: input.requires,
        }),
    summary: input.summary,
  });

const contextFiles = (): Files => ({
  ...context({
    folder: ContextFolder.Languages,
    id: 'typescript',
    rules: [
      {
        slug: 'no-any',
        statement: 'A value is never typed `any`.',
      },
    ],
    summary: 'Code written in TypeScript.',
    title: 'TypeScript',
  }),
  ...context({
    folder: ContextFolder.Languages,
    id: 'python',
    rules: [
      {
        slug: 'no-bare-except',
        statement: 'An except clause names what it catches.',
      },
    ],
    summary: 'Code written in Python.',
    title: 'Python',
  }),
  ...context({
    axis: Axis.Architecture,
    folder: ContextFolder.Platforms,
    id: 'browser',
    requires: [
      'untrusted-client',
      'unreliable-network',
    ],
    rules: [
      {
        slug: 'no-window-during-render',
        statement: 'Rendering never reads the window.',
      },
    ],
    summary: 'Code that runs in a browser tab.',
    title: 'Browser',
  }),
  ...context({
    folder: ContextFolder.Platforms,
    id: 'cli',
    requires: [
      'untrusted-client',
    ],
    rules: [
      {
        slug: 'exit-codes-are-documented',
        statement: 'Every exit code is documented.',
      },
    ],
    summary: 'A program run from a terminal.',
    title: 'CLI',
  }),
});

const implementation = (input: {
  abstract?: boolean;
  axis?: Axis;
  body?: string;
  extends?: string;
  governs?: readonly string[];
  id: string;
  languages?: readonly string[];
  requires: readonly string[];
  rules?: readonly RuleFixture[];
  summary: string;
}): Files => {
  const { axis, rules, ...card } = input;

  return blockFiles({
    ...card,
    body: `# ${input.id}\n${input.body ?? ''}`,
    dir: `blocks/implementations/${input.id}`,
    files:
      rules === undefined
        ? {}
        : rulesFile({
            ...(axis === undefined
              ? {}
              : {
                  axis,
                }),
            id: input.id,
            rules,
          }),
  });
};

const implementationFiles = (): Files => ({
  ...implementation({
    abstract: true,
    id: '_lint-base',
    languages: [
      'typescript',
    ],
    requires: [
      'typescript',
    ],
    summary: 'What every TypeScript linter shares.',
  }),
  ...implementation({
    id: 'markdownlint',
    requires: [],
    summary: 'Lints Markdown, which is no language block.',
  }),
  ...implementation({
    id: 'ruff',
    languages: [
      'python',
    ],
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
        slug: 'hooks-at-top-level',
        statement: 'A hook is called only at the top level.',
      },
    ],
    summary: 'React as every renderer shares it.',
  }),
  ...implementation({
    extends: '_react',
    axis: Axis.Architecture,
    governs: [
      '**/*.tsx',
    ],
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
    axis: Axis.Architecture,
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
    id: 'biome',
    languages: [
      'typescript',
    ],
    requires: [
      'typescript',
    ],
    summary: 'Formats and lints TypeScript.',
  }),
  ...implementation({
    axis: Axis.Workflow,
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
    axis: Axis.Workflow,
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
    axis: Axis.Workflow,
    id: 'lefthook',
    requires: [
      'git',
    ],
    rules: [
      {
        slug: 'hooks-run-the-check',
        statement: 'The pre-push hook runs the check.',
      },
    ],
    summary: 'Git hooks.',
  }),
  ...implementation({
    id: 'betterleaks',
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
      '| Requirement | How | Met |',
      '|---|---|---|',
      '| `analytics-consent-first` | tracks from the first page view | no |',
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

// Summaries of 70 bytes make the budget bite.
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
              statement: `The ${id} rule number ${position + 1} holds for every file.`,
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
export { CORE_PART, constitutionFiles };
