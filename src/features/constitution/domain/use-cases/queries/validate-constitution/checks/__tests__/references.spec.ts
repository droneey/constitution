import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  mainFile,
} from '#/features/constitution/__tests__/fixtures';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import { referencesCheck } from '../references';

const PRINCIPLES = 'blocks/core/principles.md';
const UI = 'blocks/domains/ui/ui.md';

const uiWith = (body: string): string =>
  mainFile({
    body,
    governs: [
      '**/ui/**',
    ],
    id: 'ui',
    kind: 'domain',
  });

describe('referencesCheck', () => {
  it('should find nothing when the constitution is valid', () => {
    // Arrange
    const input = checkInputOf(validFiles());

    // Act
    const findings = referencesCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each([
    {
      expected:
        'links to ../implementations/react-dom/react-dom.md, a file of the block react-dom; a block refers to another only through its front matter and with/ file names',
      path: PRINCIPLES,
      text: '# Principles\n\nSee [portals](../implementations/react-dom/react-dom.md).\n',
    },
    {
      expected:
        'links to ../i18n/, a file of the block i18n; a block refers to another only through its front matter and with/ file names',
      path: UI,
      text: uiWith('# UI\n\nSee [i18n](../i18n/).\n'),
    },
    {
      expected:
        'names the rule portals-for-overlays of react-dom; a rule refers to another only through its Implements line',
      path: PRINCIPLES,
      text: '# Principles\n\nOverlays follow `portals-for-overlays`.\n',
    },
  ])(
    'should report "$expected" when a block refers to another outside its front matter',
    ({ expected, path, text }) => {
      // Arrange
      const files = validFiles();
      files[path] = text;
      const input = checkInputOf(files);

      // Act
      const findings = referencesCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        {
          message: expected,
          path,
        },
      ]);
    },
  );

  it('should accept links and slugs when they stay inside the block or sit in a fence', () => {
    // Arrange
    const files = validFiles();
    files[UI] = uiWith(
      [
        '# UI',
        '',
        'See [the seam](with/remote-data.md) and `four-data-states`.',
        '',
        '```md',
        'Like `portals-for-overlays`, see [x](../../implementations/react-dom/react-dom.md).',
        '```',
      ].join('\n'),
    );
    const input = checkInputOf(files);

    // Act
    const findings = referencesCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });
});
