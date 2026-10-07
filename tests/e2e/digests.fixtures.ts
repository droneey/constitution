import { CORE_PART } from './constitution.fixtures';
import { INSTALLED } from './plugin-root.fixtures';

const CORE_FILES = [
  "Core's chapters, blocks/core/<name>.md, and what each governs:",
  '- code: any code no other chapter governs.',
  '- principles',
  '- architecture/principles',
  '- workflow/delivery',
].join('\n');
const KEY = "In brackets, a block's other files, named without .md; an axis alone is <axis>/<id>.";
const DOMAINS = '## Domains (blocks/domains/<id>/<id>.md)';
const PLATFORMS = '## Platforms (blocks/contexts/platforms/<id>/<id>.md)';
const LANGUAGES = '## Languages (blocks/contexts/languages/<id>/<id>.md)';
const IMPLEMENTATIONS = '## Implementations (blocks/implementations/<id>/<id>.md)';

const firstLine = (root: string): string =>
  `The droneey constitution plugin ${INSTALLED} supplies this repository's rules. Block files live under ${root}.`;

const contextWith = (input: {
  body?: readonly string[];
  facts: readonly string[];
  root: string;
}): string =>
  [
    [
      firstLine(input.root),
      ...input.facts,
    ].join('\n'),
    `${CORE_PART}${CORE_FILES}`,
    ...(input.body === undefined
      ? []
      : [
          input.body.join('\n'),
        ]),
  ]
    .join('\n\n')
    .concat('\n');

const unparsedContext = (input: { line: number; root: string }): string =>
  contextWith({
    facts: [
      `constitution.yaml does not parse at line ${input.line}; only core applies.`,
    ],
    root: input.root,
  });

const browserAppContext = (root: string): string =>
  contextWith({
    body: [
      DOMAINS,
      KEY,
      '- analytics: Measuring how the product is used.',
      '- i18n: Text in the user language.',
      '- remote-data: Data another system owns. (architecture)',
      '- ui: Screens and what a user sees on them. (architecture/forms, architecture/with/remote-data)',
      '- unreliable-network: A network that drops and delays.',
      '- untrusted-client: Code on a machine the user controls.',
      '- version-control: History of the code. (workflow)',
      PLATFORMS,
      '- browser: Code that runs in a browser tab. (architecture)',
      LANGUAGES,
      '- typescript: Code written in TypeScript.',
      IMPLEMENTATIONS,
      '- _react: React as every renderer shares it.',
      '- betterleaks: Finds secrets in commits.',
      '- biome: Formats and lints TypeScript.',
      '- git: Git as the version control. (workflow)',
      '- lefthook: Git hooks. (workflow)',
      '- matomo: Matomo web analytics.',
      '- react-dom: React in the browser. (architecture)',
      '- tanstack-query: Server state in React. (architecture)',
      '- paraglide (local, ./rules/implementations/paraglide.md): Paraglide messages, compiled per locale.',
      '## Overrides',
      '- analytics-consent-first: SHOULD until 2999-12-31',
    ],
    facts: [
      'constitution.yaml pins 1.0.0; 19 blocks are active.',
    ],
    root,
  });

const cliContext = (root: string): string =>
  contextWith({
    body: [
      DOMAINS,
      KEY,
      '- untrusted-client: Code on a machine the user controls.',
      '- version-control: History of the code. (workflow)',
      PLATFORMS,
      '- cli: A program run from a terminal.',
      LANGUAGES,
      '- typescript: Code written in TypeScript.',
      IMPLEMENTATIONS,
      '- betterleaks: Finds secrets in commits.',
      '- biome: Formats and lints TypeScript.',
      '- bun: The runtime and package manager. (workflow)',
      '- git: Git as the version control. (workflow)',
    ],
    facts: [
      'constitution.yaml pins 1.0.0; 9 blocks are active.',
    ],
    root,
  });

const libraryContext = (root: string): string =>
  contextWith({
    body: [
      DOMAINS,
      KEY,
      '- version-control: History of the code. (workflow)',
      LANGUAGES,
      '- typescript: Code written in TypeScript.',
      IMPLEMENTATIONS,
      '- betterleaks: Finds secrets in commits.',
      '- biome: Formats and lints TypeScript.',
      '- git: Git as the version control. (workflow)',
      '- lefthook: Git hooks. (workflow)',
      '## packages/react-kit',
      '- ui (domains): Screens and what a user sees on them. (architecture/forms)',
      '- unreliable-network (domains): A network that drops and delays.',
      '- untrusted-client (domains): Code on a machine the user controls.',
      '- browser (contexts/platforms): Code that runs in a browser tab. (architecture)',
      '- _react (implementations): React as every renderer shares it.',
      '- react-dom (implementations): React in the browser. (architecture)',
      '## Overrides',
      '- four-data-states: MAY in packages/react-kit',
    ],
    facts: [
      'constitution.yaml pins 1.0.0; 13 blocks are active.',
    ],
    root,
  });

const localBlocksContext = (root: string): string =>
  contextWith({
    body: [
      DOMAINS,
      KEY,
      '- ui: Screens and what a user sees on them. (architecture/forms)',
      '- unreliable-network: A network that drops and delays.',
      '- untrusted-client: Code on a machine the user controls.',
      '- version-control: History of the code. (workflow)',
      PLATFORMS,
      '- browser: Code that runs in a browser tab. (architecture)',
      LANGUAGES,
      '- typescript: Code written in TypeScript.',
      IMPLEMENTATIONS,
      '- _lint-base: What every TypeScript linter shares.',
      '- _react: React as every renderer shares it.',
      '- betterleaks: Finds secrets in commits.',
      '- git: Git as the version control. (workflow)',
      '- react-dom: React in the browser. (architecture)',
      '- git-flow (local, ./rules/implementations/git-flow.md): Git flow: a branch per change, a tag per release.',
      '- lint-kit (local, ./rules/implementations/lint-kit.md): Lints TypeScript the way this team likes.',
      '## packages/web',
      '- i18n (domains): Text in the user language.',
      '- paraglide (local, ./rules/implementations/paraglide.md): Paraglide messages, compiled per locale.',
    ],
    facts: [
      'constitution.yaml pins 1.0.0; 16 blocks are active.',
    ],
    root,
  });

const htmlSiteContext = (root: string): string =>
  contextWith({
    body: [
      DOMAINS,
      KEY,
      '- ui: Screens and what a user sees on them. (architecture/forms)',
      '- unreliable-network: A network that drops and delays.',
      '- untrusted-client: Code on a machine the user controls.',
      '- version-control: History of the code. (workflow)',
      PLATFORMS,
      '- browser: Code that runs in a browser tab. (architecture)',
      IMPLEMENTATIONS,
      '- git: Git as the version control. (workflow)',
    ],
    facts: [
      'constitution.yaml pins 1.0.0; 7 blocks are active.',
    ],
    root,
  });

const coreOnlyContext = (input: { pin: string; root: string }): string =>
  contextWith({
    facts: [
      `constitution.yaml pins ${input.pin}; 1 block is active.`,
    ],
    root: input.root,
  });

export {
  browserAppContext,
  cliContext,
  coreOnlyContext,
  htmlSiteContext,
  libraryContext,
  localBlocksContext,
  unparsedContext,
};
