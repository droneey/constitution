import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  mainFile,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { referencesCheck } from '../references';

const PRINCIPLES = 'blocks/core/principles.md';
const UI = 'blocks/domains/ui/ui.md';

const uiWith = (body: string): string =>
  mainFile({
    body,
    id: 'ui',
    kind: 'domain',
  });

describe('referencesCheck', () => {
  it.each([
    {
      expected:
        'links to ../implementations/react-dom/react-dom.md, a file of the block react-dom; a block refers to another only through its front matter and with/ file names',
      name: 'a file',
      path: PRINCIPLES,
      text: '# Principles\n\nSee [portals](../implementations/react-dom/react-dom.md).\n',
    },
    {
      expected:
        'links to ../i18n/, a file of the block i18n; a block refers to another only through its front matter and with/ file names',
      name: 'the folder',
      path: UI,
      text: uiWith('# UI\n\nSee [i18n](../i18n/).\n'),
    },
  ])(
    'should report a link into another block when it leads to $name of that block',
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

  it.each([
    {
      name: 'a sentence that mentions the Implements label names it',
      text: '# Principles\n\nName `portals-for-overlays` on its **Implements:** line.\n',
    },
    {
      name: 'a sentence that holds a pipe names it',
      text: '# Principles\n\nAnswer `portals-for-overlays` in a row: | slug | how | status |\n',
    },
    {
      name: 'a sentence after a lone backtick names it',
      text: '# Principles\n\nA slug never holds a backtick (`).\n\nOverlays follow `portals-for-overlays`.\n',
    },
  ])('should report the rule of another block when $name', ({ text }) => {
    // Arrange
    const files = validFiles();
    files[PRINCIPLES] = text;
    const input = checkInputOf(files);

    // Act
    const findings = referencesCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'names the rule portals-for-overlays of react-dom; a rule refers to another only through its Implements line',
        path: PRINCIPLES,
      },
    ]);
  });

  it.each([
    {
      name: 'a block names its own rule',
      path: PRINCIPLES,
      text: '# Principles\n\nAs `rules-bind` says.\n',
    },
    {
      name: 'a fence holds the link and the rule',
      path: UI,
      text: uiWith(
        [
          '# UI',
          '',
          '```md',
          'Like `portals-for-overlays`, see [x](../../implementations/react-dom/react-dom.md).',
          '```',
        ].join('\n'),
      ),
    },
    {
      name: 'an indented table row names the rule',
      path: PRINCIPLES,
      text: '# Principles\n\n- Answer it in a row:\n\n  | `portals-for-overlays` | how | met |\n',
    },
    {
      name: 'a link leads into a folder whose name only begins with the folder of a block',
      path: PRINCIPLES,
      text: '# Principles\n\nSee [the kit](../domains/ui-kit/kit.md).\n',
    },
  ])('should find nothing when $name', ({ path, text }) => {
    // Arrange
    const files = validFiles();
    files[path] = text;
    const input = checkInputOf(files);

    // Act
    const findings = referencesCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });
});
