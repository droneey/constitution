import { coreText } from './constitution.fixtures';
import { INSTALLED } from './plugin-root.fixtures';

// The digests a case pins whole, as a reader sees them: the one place their
// wording is written down.
const KEY =
  "In brackets, a block's chapters and seams, named without .md: foundation's first, then <axis>: <file>, ... An implementation is named by its library alone; square brackets name a block's pack or, in an application, its layer.";
const DOMAINS = '## Domains (blocks/domains/<id>/<id>.md)';
const PLATFORMS = '## Platforms (blocks/contexts/platforms/<id>/<id>.md)';
const LANGUAGES = '## Languages (blocks/contexts/languages/<id>/<id>.md)';
const IMPLEMENTATIONS = '## Implementations (blocks/implementations/<id>/<id>.md)';

const firstLine = (root: string): string =>
  `The Droneey Constitution ${INSTALLED} supplies this repository's rules. Block files live under ${root}.`;

const contextWith = (input: {
  body?: readonly string[];
  facts: readonly string[];
  root: string;
  warnings?: readonly string[];
}): string =>
  [
    [
      firstLine(input.root),
      ...input.facts,
    ].join('\n'),
    ...(input.warnings === undefined
      ? []
      : [
          input.warnings.join('\n'),
        ]),
    coreText.trimEnd(),
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
      '- analytics: Measuring how the product is used. (consent)',
      '- i18n: Text in the user language. (plurals)',
      '- remote-data: Data another system owns. (architecture: reads)',
      '- ui: Screens and what a user sees on them. (screens; architecture: forms, with/remote-data)',
      '- unreliable-network: A network that drops and delays. (retries)',
      '- untrusted-client: Code on a machine the user controls. (secrets)',
      '- version-control: History of the code. (workflow: commits)',
      PLATFORMS,
      '- browser: Code that runs in a browser tab. (architecture: render)',
      LANGUAGES,
      '- typescript: Code written in TypeScript. (types)',
      IMPLEMENTATIONS,
      '- _react (hooks)',
      '- betterleaks',
      '- biome',
      '- git (workflow: tags)',
      '- lefthook (workflow: hooks)',
      '- matomo (tracking)',
      '- react-dom (architecture: portals)',
      '- tanstack-query (architecture: queries)',
      '- paraglide [constitution]',
      '## Overrides',
      '- analytics-consent-first: SHOULD until 2999-12-31',
    ],
    facts: [
      'constitution.yaml makes 19 blocks active.',
    ],
    root,
  });

const everyCodeContext = (root: string): string =>
  contextWith({
    body: [
      DOMAINS,
      KEY,
      '- analytics: Measuring how the product is used. (consent)',
      '- ui: Screens and what a user sees on them. (screens; architecture: forms)',
      '- version-control: History of the code. (workflow: commits)',
      LANGUAGES,
      '- typescript: Code written in TypeScript. (types)',
      IMPLEMENTATIONS,
      '- _react (hooks)',
      '- git (workflow: tags)',
      '- matomo (tracking)',
      '- react-dom (architecture: portals)',
    ],
    facts: [
      'constitution.yaml makes 9 blocks active.',
    ],
    root,
    warnings: [
      '⚠️ Warnings — tell the user at the start of the session',
      '- missing: react-dom needs browser — add browser to platforms',
      '- abstract: _react cannot be listed — list react-dom',
      '- unknown: tanstak-query is not a block — check the name',
      '- wrong-key: ui is a domain — move it from implementations to domains',
      '- config: constitution.yaml has no platforms key — add platforms: []',
      '- pack: packs/gone is not installed — run mise install, or check the path',
      '- not-met: matomo does not meet analytics-consent-first — see its Requirements table',
      '- override: four-data-states expired on 2020-01-01 — renew or remove it',
    ],
  });

export { browserAppContext, everyCodeContext, unparsedContext };
