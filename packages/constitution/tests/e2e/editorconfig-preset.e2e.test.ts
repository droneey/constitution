import { describe, expect, it } from 'bun:test';

import { miseBinary } from './mise.fixtures';
import { nodeBinary } from './package.fixtures';
import { loadOf } from './preset-load.fixtures';

const SCRIPT = 'scripts/check.sh';

const formattedIf = [
  '#!/bin/sh',
  'if true; then',
  '  echo "checked"',
  'fi',
];
const formattedCase = [
  '#!/bin/sh',
  'case "$1" in',
  '  ok) echo "checked" ;;',
  'esac',
];

describe("the configuration EditorConfig's presets write", () => {
  // Why: Biome reads the .editorconfig of a unit that follows it, and fails on a value it does not
  // know; it prints a summary of every check, so the status says it all.
  it('should load in Biome with no value it does not know when a unit follows every block EditorConfig is configured for', async () => {
    // Act
    const { status } = await loadOf('editorconfig', {
      blocks: [
        'biome',
        'typescript',
      ],
      command: [
        nodeBinary('biome'),
        'check',
        '--error-on-warnings',
        '--vcs-enabled=false',
        'src/order.ts',
      ],
      files: {
        'src/order.ts': "export const ORDER_KIND = 'order';\n",
      },
    });

    // Assert
    expect(status).toBe(0);
  });

  // Why: shfmt skips a key or a value of the .editorconfig it does not know, so each it reads has a
  // script it must write otherwise than by default.
  it.each([
    {
      condition: 'a script is already formatted as the presets set it',
      formatted: formattedIf,
      script: '#!/bin/sh\nif true; then\n  echo "checked"\nfi\n',
    },
    {
      condition:
        'its body is indented by a tab, as shfmt indents by default, where the indent is two spaces',
      formatted: formattedIf,
      script: '#!/bin/sh\nif true; then\n\techo "checked"\nfi\n',
    },
    {
      condition: 'its case patterns sit level with case, as shfmt sets them by default',
      formatted: formattedCase,
      script: '#!/bin/sh\ncase "$1" in\nok) echo "checked" ;;\nesac\n',
    },
  ])(
    'should write the script as the presets format it when $condition',
    async ({ formatted, script }) => {
      // Act
      const { output } = await loadOf('editorconfig', {
        command: [
          miseBinary('shfmt'),
          SCRIPT,
        ],
        files: {
          [SCRIPT]: script,
        },
      });

      // Assert
      expect(output).toStrictEqual(formatted);
    },
  );
});
