import { CORE_PART } from './constitution.fixtures';
import { INSTALLED } from './plugin-root.fixtures';

const CORE_FILES =
  "Core's files, under blocks/core/: core.md, foundation/code.md, foundation/principles.md, architecture/principles.md, workflow/delivery.md.";
const DOMAINS = '## Domains (blocks/domains/<id>/<id>.md)';
const PLATFORMS = '## Platforms (blocks/contexts/platforms/<id>/<id>.md)';
const LANGUAGES = '## Languages (blocks/contexts/languages/<id>/<id>.md)';
const IMPLEMENTATIONS =
  '## Implementations (blocks/implementations/<id>/<id>.md)';
const HEADLINES = '## MUST headlines';

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
      '- analytics: Measuring how the product is used. Also: foundation/analytics.md',
      '- i18n: Text in the user language. Also: foundation/i18n.md',
      '- remote-data: Data another system owns. Also: architecture/remote-data.md',
      '- ui: Screens and what a user sees on them. Also: foundation/ui.md, architecture/forms.md, architecture/with/remote-data.md',
      '- unreliable-network: A network that drops and delays. Also: foundation/unreliable-network.md',
      '- untrusted-client: Code on a machine the user controls. Also: foundation/untrusted-client.md',
      '- version-control: History of the code. Also: workflow/version-control.md',
      PLATFORMS,
      '- browser: Code that runs in a browser tab. Also: architecture/browser.md',
      LANGUAGES,
      '- typescript: Code written in TypeScript. Also: foundation/typescript.md',
      IMPLEMENTATIONS,
      '- _react: React as every renderer shares it. Also: foundation/_react.md',
      '- betterleaks: Finds secrets in commits.',
      '- biome: Formats and lints TypeScript.',
      '- git: Git as the version control. Also: workflow/git.md',
      '- lefthook: Git hooks. Also: workflow/lefthook.md',
      '- matomo: Matomo web analytics. Also: foundation/matomo.md',
      '- react-dom: React in the browser. Also: architecture/react-dom.md',
      '- tanstack-query: Server state in React. Also: architecture/tanstack-query.md',
      '- paraglide (local, ./rules/implementations/paraglide.md): Paraglide messages, compiled per locale.',
      '## Overrides',
      '- analytics-consent-first: SHOULD until 2999-12-31',
      '',
      HEADLINES,
      '- analytics-consent-first (SHOULD): Nothing is tracked before the user consents.',
      '- plurals-by-cldr: Plural forms follow CLDR.',
      '- reads-are-cancellable: A read of remote data can be cancelled.',
      '- four-data-states: Every data view shows loading, empty, error and content.',
      '- loading-state-shown: A view shows that it loads.',
      '- skeleton-matches-content: A skeleton has the shape of its content.',
      '- error-state-offers-retry: An error state offers a retry.',
      '- labels-on-fields: Every field has a visible label.',
      '- optimistic-writes-roll-back: An optimistic write rolls back when the server refuses it.',
      '- retries-back-off: A retry waits longer each time.',
      '- no-secret-in-the-client: The client holds no secret.',
      '- commits-are-atomic: A commit holds one change.',
      '- no-window-during-render: Rendering never reads the window.',
      '- no-any: A value is never typed `any`.',
      '- hooks-at-top-level: A hook is called only at the top level.',
      '- tags-are-annotated: A release tag is annotated.',
      '- hooks-run-the-check: The pre-push hook runs the check.',
      '- site-id-from-config: The site id comes from configuration.',
      '- portals-for-overlays: An overlay renders through a portal.',
      '- query-keys-are-arrays: A query key is an array.',
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
      '- untrusted-client: Code on a machine the user controls. Also: foundation/untrusted-client.md',
      '- version-control: History of the code. Also: workflow/version-control.md',
      PLATFORMS,
      '- cli: A program run from a terminal. Also: foundation/cli.md',
      LANGUAGES,
      '- typescript: Code written in TypeScript. Also: foundation/typescript.md',
      IMPLEMENTATIONS,
      '- betterleaks: Finds secrets in commits.',
      '- biome: Formats and lints TypeScript.',
      '- bun: The runtime and package manager. Also: workflow/bun.md',
      '- git: Git as the version control. Also: workflow/git.md',
      '',
      HEADLINES,
      '- no-secret-in-the-client: The client holds no secret.',
      '- commits-are-atomic: A commit holds one change.',
      '- exit-codes-are-documented: Every exit code is documented.',
      '- no-any: A value is never typed `any`.',
      '- lockfile-committed: The lockfile is committed.',
      '- tags-are-annotated: A release tag is annotated.',
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
      '- version-control: History of the code. Also: workflow/version-control.md',
      LANGUAGES,
      '- typescript: Code written in TypeScript. Also: foundation/typescript.md',
      IMPLEMENTATIONS,
      '- betterleaks: Finds secrets in commits.',
      '- biome: Formats and lints TypeScript.',
      '- git: Git as the version control. Also: workflow/git.md',
      '- lefthook: Git hooks. Also: workflow/lefthook.md',
      '## packages/react-kit',
      '- ui (domains): Screens and what a user sees on them. Also: foundation/ui.md, architecture/forms.md',
      '- unreliable-network (domains): A network that drops and delays. Also: foundation/unreliable-network.md',
      '- untrusted-client (domains): Code on a machine the user controls. Also: foundation/untrusted-client.md',
      '- browser (contexts/platforms): Code that runs in a browser tab. Also: architecture/browser.md',
      '- _react (implementations): React as every renderer shares it. Also: foundation/_react.md',
      '- react-dom (implementations): React in the browser. Also: architecture/react-dom.md',
      '## Overrides',
      '- four-data-states: MAY in packages/react-kit',
      '',
      HEADLINES,
      '- four-data-states (MAY in packages/react-kit): Every data view shows loading, empty, error and content.',
      '- loading-state-shown (MAY in packages/react-kit via four-data-states): A view shows that it loads.',
      '- skeleton-matches-content (MAY in packages/react-kit via four-data-states): A skeleton has the shape of its content.',
      '- error-state-offers-retry: An error state offers a retry.',
      '- labels-on-fields: Every field has a visible label.',
      '- retries-back-off: A retry waits longer each time.',
      '- no-secret-in-the-client: The client holds no secret.',
      '- commits-are-atomic: A commit holds one change.',
      '- no-window-during-render: Rendering never reads the window.',
      '- no-any: A value is never typed `any`.',
      '- hooks-at-top-level: A hook is called only at the top level.',
      '- tags-are-annotated: A release tag is annotated.',
      '- hooks-run-the-check: The pre-push hook runs the check.',
      '- portals-for-overlays: An overlay renders through a portal.',
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
      '- ui: Screens and what a user sees on them. Also: foundation/ui.md, architecture/forms.md',
      '- unreliable-network: A network that drops and delays. Also: foundation/unreliable-network.md',
      '- untrusted-client: Code on a machine the user controls. Also: foundation/untrusted-client.md',
      '- version-control: History of the code. Also: workflow/version-control.md',
      PLATFORMS,
      '- browser: Code that runs in a browser tab. Also: architecture/browser.md',
      LANGUAGES,
      '- typescript: Code written in TypeScript. Also: foundation/typescript.md',
      IMPLEMENTATIONS,
      '- _react: React as every renderer shares it. Also: foundation/_react.md',
      '- betterleaks: Finds secrets in commits.',
      '- git: Git as the version control. Also: workflow/git.md',
      '- react-dom: React in the browser. Also: architecture/react-dom.md',
      '- git-flow (local, ./rules/implementations/git-flow.md): Git flow: a branch per change, a tag per release.',
      '- lint-kit (local, ./rules/implementations/lint-kit.md): Lints TypeScript the way this team likes.',
      '## packages/web',
      '- i18n (domains): Text in the user language. Also: foundation/i18n.md',
      '- paraglide (local, ./rules/implementations/paraglide.md): Paraglide messages, compiled per locale.',
      '',
      HEADLINES,
      '- plurals-by-cldr: Plural forms follow CLDR.',
      '- four-data-states: Every data view shows loading, empty, error and content.',
      '- loading-state-shown: A view shows that it loads.',
      '- skeleton-matches-content: A skeleton has the shape of its content.',
      '- error-state-offers-retry: An error state offers a retry.',
      '- labels-on-fields: Every field has a visible label.',
      '- retries-back-off: A retry waits longer each time.',
      '- no-secret-in-the-client: The client holds no secret.',
      '- commits-are-atomic: A commit holds one change.',
      '- no-window-during-render: Rendering never reads the window.',
      '- no-any: A value is never typed `any`.',
      '- hooks-at-top-level: A hook is called only at the top level.',
      '- tags-are-annotated: A release tag is annotated.',
      '- portals-for-overlays: An overlay renders through a portal.',
    ],
    facts: [
      'constitution.yaml pins 1.0.0; 15 blocks are active.',
    ],
    root,
  });

const htmlSiteContext = (root: string): string =>
  contextWith({
    body: [
      DOMAINS,
      '- ui: Screens and what a user sees on them. Also: foundation/ui.md, architecture/forms.md',
      '- unreliable-network: A network that drops and delays. Also: foundation/unreliable-network.md',
      '- untrusted-client: Code on a machine the user controls. Also: foundation/untrusted-client.md',
      '- version-control: History of the code. Also: workflow/version-control.md',
      PLATFORMS,
      '- browser: Code that runs in a browser tab. Also: architecture/browser.md',
      IMPLEMENTATIONS,
      '- git: Git as the version control. Also: workflow/git.md',
      '',
      HEADLINES,
      '- four-data-states: Every data view shows loading, empty, error and content.',
      '- loading-state-shown: A view shows that it loads.',
      '- skeleton-matches-content: A skeleton has the shape of its content.',
      '- error-state-offers-retry: An error state offers a retry.',
      '- labels-on-fields: Every field has a visible label.',
      '- retries-back-off: A retry waits longer each time.',
      '- no-secret-in-the-client: The client holds no secret.',
      '- commits-are-atomic: A commit holds one change.',
      '- no-window-during-render: Rendering never reads the window.',
      '- tags-are-annotated: A release tag is annotated.',
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
