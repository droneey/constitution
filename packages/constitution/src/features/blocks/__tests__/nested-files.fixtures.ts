import type { Files } from './constitution.fixtures';
import { chapterFile, rule } from './constitution.fixtures';

interface NestedCardFixture {
  readonly governs?: readonly string[];
  readonly id: string;
  readonly requires?: readonly string[];
}

interface NestedPassportFixture extends NestedCardFixture {
  readonly body?: string;
}

interface NestedBlockFixture extends NestedCardFixture {
  readonly files?: Readonly<Files>;
  readonly layerFolder: string;
}

const list = (items: readonly string[] | undefined): string => JSON.stringify(items ?? []);

const nestedPassportFile = (block: NestedPassportFixture): string =>
  [
    '---',
    `id: ${block.id}`,
    `summary: The ${block.id} block.`,
    `requires: ${list(block.requires)}`,
    'languages: []',
    `governs: ${list(block.governs)}`,
    '---',
    '',
    block.body ?? `# ${block.id}\n`,
  ].join('\n');

const nestedBlockFiles = (input: NestedBlockFixture): Files => {
  const { files = {}, layerFolder, ...card } = input;
  const dir = `blocks/${layerFolder}/${input.id}`;
  const name = input.id.slice(input.id.lastIndexOf('/') + 1);

  return {
    [`${dir}/${name}.md`]: nestedPassportFile(card),
    ...Object.fromEntries(
      Object.entries(files).map(([path, text]) => [
        `${dir}/${path}`,
        text,
      ]),
    ),
  };
};

const nestedFiles = (): Files => ({
  'blocks/core/core.md': nestedPassportFile({
    body: '# Core\n',
    id: 'core',
  }),
  'blocks/core/@foundation/code.md': chapterFile(
    'Code',
    rule({
      slug: 'code-reads-as-prose',
    }),
  ),
  ...nestedBlockFiles({
    files: {
      '@foundation/screens.md': chapterFile(
        'Screens',
        rule({
          slug: 'screen-shows-one-task',
        }),
      ),
    },
    id: 'presentation',
    layerFolder: 'domains',
  }),
  ...nestedBlockFiles({
    files: {
      '@foundation/tokens.md': chapterFile(
        'Tokens',
        rule({
          slug: 'colour-taken-from-a-token',
        }),
      ),
    },
    id: 'presentation/design-system',
    layerFolder: 'domains',
  }),
  ...nestedBlockFiles({
    id: 'client',
    layerFolder: 'contexts/platforms',
  }),
  ...nestedBlockFiles({
    files: {
      '@foundation/storage.md': chapterFile(
        'Storage',
        rule({
          slug: 'tab-keeps-no-secret',
        }),
      ),
    },
    id: 'client/browser',
    layerFolder: 'contexts/platforms',
  }),
  ...nestedBlockFiles({
    id: 'typescript',
    layerFolder: 'contexts/languages',
  }),
  ...nestedBlockFiles({
    files: {
      '@architecture/hooks.md': chapterFile(
        'Hooks',
        rule({
          slug: 'hook-named-by-its-use',
        }),
      ),
    },
    id: 'react',
    layerFolder: 'implementations',
    requires: [
      'presentation',
      'typescript',
    ],
  }),
  ...nestedBlockFiles({
    id: 'react/react-dom',
    layerFolder: 'implementations',
    requires: [
      'client/browser',
    ],
  }),
  ...nestedBlockFiles({
    files: {
      '@foundation/with/presentation/design-system.md': chapterFile(
        'Ink and the design system',
        rule({
          slug: 'terminal-colour-taken-from-a-token',
          tightens: 'colour-taken-from-a-token',
        }),
      ),
    },
    id: 'react/ink',
    layerFolder: 'implementations',
  }),
  ...nestedBlockFiles({
    id: 'task-runner',
    layerFolder: 'implementations',
  }),
  ...nestedBlockFiles({
    id: 'js-runtime',
    layerFolder: 'implementations',
  }),
  ...nestedBlockFiles({
    id: 'js-runtime/bun',
    layerFolder: 'implementations',
    requires: [
      'task-runner',
    ],
  }),
});

export { nestedBlockFiles, nestedFiles, nestedPassportFile };
