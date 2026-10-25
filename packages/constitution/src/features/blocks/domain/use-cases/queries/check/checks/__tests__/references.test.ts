import { describe, expect, it } from 'bun:test';

import { checkInputOf, findingOf } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { referencesCheck } from '../references';

const PRINCIPLES = 'blocks/core/foundation/principles.md';
const UI = 'blocks/domains/ui/foundation/forms.md';

describe('referencesCheck', () => {
  it.each([
    {
      name: 'a file',
      names: [
        '../../implementations/react-dom/react-dom.md',
        'react-dom',
      ],
      path: PRINCIPLES,
      text: '# Principles\n\nSee [portals](../../implementations/react-dom/react-dom.md).\n',
    },
    {
      name: 'the folder',
      names: [
        '../../i18n/',
        'i18n',
      ],
      path: UI,
      text: '# UI\n\nSee [i18n](../../i18n/).\n',
    },
  ])(
    'should report a link into another block when it leads to $name of that block',
    ({ names, path, text }) => {
      // Arrange
      const files = validFiles();

      files[path] = text;

      const input = checkInputOf(files);

      // Act
      const findings = referencesCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        findingOf({
          code: 'link-into-other-block',
          names,
          path,
        }),
      ]);
    },
  );

  it.each([
    {
      name: 'a sentence that mentions the parent in a heading names it',
      text: '# Principles\n\nName `portals-for-overlays` after the arrow of a heading.\n',
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
      findingOf({
        code: 'names-rule-of-other-block',
        names: [
          'portals-for-overlays',
          'react-dom',
        ],
        path: PRINCIPLES,
      }),
    ]);
  });

  it('should report each decision when a block cites it by number', () => {
    // Arrange
    const files = validFiles();

    files[UI] = '# UI\n\nAs ADR-0012 decided, and `ADR-0030` after it; ADR-0012 again.\n';

    const input = checkInputOf(files);

    // Act
    const findings = referencesCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      findingOf({
        code: 'cites-decision',
        names: [
          'ADR-0012',
        ],
        path: UI,
      }),
      findingOf({
        code: 'cites-decision',
        names: [
          'ADR-0030',
        ],
        path: UI,
      }),
    ]);
  });

  it.each([
    {
      name: 'a fence cites a decision',
      path: UI,
      text: '# UI\n\n```md\nSee ADR-0012.\n```\n',
    },
    {
      name: 'a block names its own rule',
      path: PRINCIPLES,
      text: '# Principles\n\nAs `rules-bind` says.\n',
    },
    {
      name: 'a fence holds the link and the rule',
      path: UI,
      text: [
        '# UI',
        '',
        '```md',
        'Like `portals-for-overlays`, see [x](../../../implementations/react-dom/react-dom.md).',
        '```',
      ].join('\n'),
    },
    {
      name: 'an indented table row names the rule',
      path: PRINCIPLES,
      text: '# Principles\n\n- Answer it in a row:\n\n  | `portals-for-overlays` | how | yes |\n',
    },
    {
      name: 'a link leads into a folder whose name only begins with the folder of a block',
      path: PRINCIPLES,
      text: '# Principles\n\nSee [the kit](../../domains/ui-kit/kit.md).\n',
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
