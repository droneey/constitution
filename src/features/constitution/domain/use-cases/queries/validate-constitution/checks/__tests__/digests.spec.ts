import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  mainFile,
  rule,
  textOf,
  without,
} from '#/features/constitution/__tests__/fixtures';
import {
  GOLDEN_CORE,
  GOLDEN_INDEX,
} from '#/features/constitution/__tests__/valid-digests';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import { digestsCheck } from '../digests';

const INDEX = 'digests/index.tsv';
const CORE = 'digests/core.md';
const CORE_MAIN = 'blocks/core/core.md';
const STALE = 'differs from its regeneration; run bun run digests:write';

describe('digestsCheck', () => {
  it('should find nothing when the committed digests equal their regeneration', () => {
    // Arrange
    const input = checkInputOf(validFiles());

    // Act
    const findings = digestsCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report the index when a rule changed since it was written', () => {
    // Arrange
    const files = validFiles();
    const i18n = 'blocks/domains/i18n/i18n.md';
    files[i18n] = `${textOf({
      files,
      path: i18n,
    })}\n${rule({
      slug: 'i18n-typed-keys',
    })}`;
    const input = checkInputOf(files);

    // Act
    const findings = digestsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: STALE,
        path: INDEX,
      },
    ]);
  });

  it.each([
    {
      name: 'it is edited by hand',
      path: CORE,
      text: GOLDEN_CORE.replace('Read [principles]', 'See [principles]'),
    },
    {
      name: 'it ends in one more newline',
      path: CORE,
      text: `${GOLDEN_CORE}\n`,
    },
    {
      name: 'it lacks its last newline',
      path: INDEX,
      text: GOLDEN_INDEX.slice(0, -1),
    },
  ])('should report $path as stale when $name', ({ path, text }) => {
    // Arrange
    const files = validFiles();
    files[path] = text;
    const input = checkInputOf(files);

    // Act
    const findings = digestsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: STALE,
        path,
      },
    ]);
  });

  it('should report both digests when they are missing', () => {
    // Arrange
    const files = without({
      files: without({
        files: validFiles(),
        path: INDEX,
      }),
      path: CORE,
    });
    const input = checkInputOf(files);

    // Act
    const findings = digestsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'is missing; run bun run digests:write',
        path: INDEX,
      },
      {
        message: 'is missing; run bun run digests:write',
        path: CORE,
      },
    ]);
  });

  it.each([
    {
      path: 'digests/old.tsv',
    },
    {
      path: 'digests/archive/index.tsv',
    },
  ])('should report $path when the generator does not write it', ({ path }) => {
    // Arrange
    const files = validFiles();
    files[path] = GOLDEN_INDEX;
    const input = checkInputOf(files);

    // Act
    const findings = digestsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'is not a digest the generator writes; delete it',
        path,
      },
    ]);
  });

  it.each([
    {
      path: 'digests-howto.md',
    },
    {
      path: 'docs/digests/overview.md',
    },
  ])('should find nothing when $path sits outside digests/', ({ path }) => {
    // Arrange
    const files = validFiles();
    files[path] = '# A note\n';
    const input = checkInputOf(files);

    // Act
    const findings = digestsCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should pass the core budget finding through when core passes 3,500 bytes', () => {
    // Arrange
    const files = validFiles();
    files[CORE_MAIN] = mainFile({
      body: `# Core\n\n${'Ω'.repeat(1750)}\n\n${rule({
        slug: 'rules-bind',
      })}`,
      chapters: [
        'principles.md',
      ],
      id: 'core',
      kind: 'core',
    });
    const input = checkInputOf(files);

    // Act
    const findings = digestsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'makes a core part of 3669 bytes; the digest holds at most 3500 of core',
        path: CORE_MAIN,
      },
      {
        message: STALE,
        path: CORE,
      },
    ]);
  });
});
