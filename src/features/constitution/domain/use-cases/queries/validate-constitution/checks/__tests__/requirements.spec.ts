import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  rule,
  textOf,
} from '#/features/constitution/__tests__/fixtures';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import { requirementsCheck } from '../requirements';

const LINGUI = 'blocks/implementations/lingui/lingui.md';
const BIOME_WITH_LINGUI = 'blocks/implementations/biome/with/lingui.md';
const ANSWER = '| `i18n-plurals-by-cldr` | ICU plural | met |';

const answering = (
  rows: readonly string[],
): ReturnType<typeof checkInputOf> => {
  const files = validFiles();
  files[LINGUI] = textOf({
    files,
    path: LINGUI,
  }).replace(ANSWER, rows.join('\n'));

  return checkInputOf(files);
};

describe('requirementsCheck', () => {
  it('should find nothing when the constitution is valid', () => {
    // Arrange
    const input = checkInputOf(validFiles());

    // Act
    const findings = requirementsCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it.each([
    {
      name: 'a chapter',
      path: 'blocks/core/principles.md',
    },
    {
      name: 'a with/ file',
      path: 'blocks/domains/ui/with/remote-data.md',
    },
  ])(
    'should report a Requirements table once per file when $name of a block that is no implementation holds one',
    ({ path }) => {
      // Arrange
      const files = validFiles();
      files[path] = [
        textOf({
          files,
          path,
        }),
        '## Requirements',
        '| `four-data-states` | tests | met |',
        '| `reads-are-cancellable` | tests | met |',
      ].join('\n');
      const input = checkInputOf(files);

      // Act
      const findings = requirementsCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        {
          message: 'answers requirements, which only an implementation does',
          path,
        },
      ]);
    },
  );

  it('should report a with/ file once when an implementation answers two requirements in it', () => {
    // Arrange
    const files = validFiles();
    files[BIOME_WITH_LINGUI] = [
      '# Biome with Lingui',
      '',
      '## Requirements',
      '',
      '| Requirement | How | Status |',
      '|---|---|---|',
      '| `no-any` | the noExplicitAny rule | met |',
      '| `dependencies-point-inward` | review | met |',
      '',
    ].join('\n');
    const input = checkInputOf(files);

    // Act
    const findings = requirementsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'answers requirements in a with/ file; a block answers them in its main file or a chapter',
        path: BIOME_WITH_LINGUI,
      },
    ]);
  });

  it.each([
    {
      expected: 'answers "no-such-rule", which is not a rule',
      row: '| `no-such-rule` | x | met |',
    },
    {
      expected:
        'answers "portals-for-overlays" of react-dom, which its block may not refer to',
      row: '| `portals-for-overlays` | x | met |',
    },
    {
      expected:
        'answers "i18n-plurals-by-cldr" with the status "done"; a status is met, partial: <workaround> or not met',
      row: '| `i18n-plurals-by-cldr` | ICU plural | done |',
    },
    {
      expected: 'answers "i18n-plurals-by-cldr" without saying how',
      row: '| `i18n-plurals-by-cldr` |  | met |',
    },
  ])(
    'should report "$expected" when a row breaks its rule',
    ({ expected, row }) => {
      // Arrange
      const input = answering([
        row,
      ]);

      // Act
      const findings = requirementsCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        {
          message: expected,
          path: LINGUI,
        },
      ]);
    },
  );

  it('should report the second answer when a block answers one requirement twice', () => {
    // Arrange
    const input = answering([
      ANSWER,
      '| `i18n-plurals-by-cldr` | again | partial: plural only |',
    ]);

    // Act
    const findings = requirementsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'answers "i18n-plurals-by-cldr" twice',
        path: LINGUI,
      },
    ]);
  });

  it('should report an answer when it names a rule of its own block', () => {
    // Arrange
    const files = validFiles();
    files[LINGUI] = textOf({
      files,
      path: LINGUI,
    }).replace(
      '## Requirements',
      `${rule({
        slug: 'catalogs-compile',
      })}\n## Requirements`,
    );
    files[LINGUI] = textOf({
      files,
      path: LINGUI,
    }).replace(ANSWER, `${ANSWER}\n| \`catalogs-compile\` | the CLI | met |`);
    const input = checkInputOf(files);

    // Act
    const findings = requirementsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'answers "catalogs-compile", a rule of its own block; a Requirements table answers the blocks above',
        path: LINGUI,
      },
    ]);
  });
});
