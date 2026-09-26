import { describe, expect, it } from 'bun:test';

import {
  loadFiles,
  mainFile,
  rule,
  without,
} from '#/features/constitution/__tests__/fixtures';
import { GOLDEN_CORE } from '#/features/constitution/__tests__/valid-digests';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import { corePartOf } from '../core.utils';

const CORE = 'blocks/core/core.md';
const PRINCIPLES = 'blocks/core/principles.md';
const TESTING = 'blocks/core/testing.md';
const LAWS = 'Laws: dependencies-point-inward.';

const coreFile = (input: {
  body: string;
  chapters: readonly string[];
}): string =>
  mainFile({
    body: input.body,
    chapters: input.chapters,
    id: 'core',
    kind: 'core',
  });

describe('corePartOf', () => {
  it('should join the core file and the laws of principles when core exists', () => {
    // Arrange
    const constitution = loadFiles(validFiles());

    // Act
    const part = corePartOf(constitution);

    // Assert
    expect(part).toStrictEqual({
      findings: [],
      text: GOLDEN_CORE,
    });
  });

  it('should be empty when there is no core', () => {
    // Arrange
    const constitution = loadFiles(
      without({
        files: without({
          files: validFiles(),
          path: CORE,
        }),
        path: PRINCIPLES,
      }),
    );

    // Act
    const part = corePartOf(constitution);

    // Assert
    expect(part).toStrictEqual({
      findings: [],
      text: '',
    });
  });

  it('should hold only the laws when core.md has no body', () => {
    // Arrange
    const files = validFiles();
    files[CORE] = coreFile({
      body: '',
      chapters: [
        'principles.md',
      ],
    });
    const constitution = loadFiles(files);

    // Act
    const part = corePartOf(constitution);

    // Assert
    expect(part).toStrictEqual({
      findings: [],
      text: `${LAWS}\n`,
    });
  });

  // Beside the filler the part holds 43 bytes: "# Core", two paragraph breaks,
  // the laws line and the closing newline; Ω takes two bytes of UTF-8.
  it.each([
    {
      filler: 'a'.repeat(3457),
      findings: [],
      name: '3,500 bytes',
    },
    {
      filler: 'a'.repeat(3458),
      findings: [
        {
          message:
            'makes a core part of 3501 bytes; the digest holds at most 3500 of core',
          path: CORE,
        },
      ],
      name: '3,501 bytes',
    },
    {
      filler: 'Ω'.repeat(1729),
      findings: [
        {
          message:
            'makes a core part of 3501 bytes; the digest holds at most 3500 of core',
          path: CORE,
        },
      ],
      name: '3,501 bytes in 1,772 characters',
    },
  ])(
    'should report core only past 3,500 UTF-8 bytes when its part holds $name',
    ({ filler, findings }) => {
      // Arrange
      const files = validFiles();
      files[CORE] = coreFile({
        body: `# Core\n\n${filler}\n`,
        chapters: [
          'principles.md',
        ],
      });
      const constitution = loadFiles(files);

      // Act
      const part = corePartOf(constitution);

      // Assert
      expect(part).toStrictEqual({
        findings,
        text: `# Core\n\n${filler}\n\n${LAWS}\n`,
      });
    },
  );

  it.each([
    {
      name: 'principles holds two MUST rules',
      principles: `${rule({
        slug: 'names-say-what',
      })}\n${rule({
        slug: 'dependencies-point-inward',
      })}`,
      testing: '',
      text: '# Core\n\nLaws: names-say-what, dependencies-point-inward.\n',
    },
    {
      name: 'principles also holds a SHOULD and a MAY rule',
      principles: `${rule({
        slug: 'dependencies-point-inward',
      })}\n${rule({
        level: 'SHOULD',
        slug: 'names-say-what',
      })}\n${rule({
        level: 'MAY',
        slug: 'comments-say-why',
      })}`,
      testing: '',
      text: `# Core\n\n${LAWS}\n`,
    },
    {
      name: 'another chapter of core holds a MUST rule',
      principles: rule({
        slug: 'dependencies-point-inward',
      }),
      testing: rule({
        slug: 'tests-ship-with-the-code',
      }),
      text: `# Core\n\n${LAWS}\n`,
    },
    {
      name: 'principles holds no MUST rule',
      principles: rule({
        level: 'SHOULD',
        slug: 'dependencies-point-inward',
      }),
      testing: '',
      text: '# Core\n',
    },
  ])(
    'should name only the MUST rules of principles as laws, in chapter order, when $name',
    ({ principles, testing, text }) => {
      // Arrange
      const files = validFiles();
      files[CORE] = coreFile({
        body: '# Core\n\n\n',
        chapters: [
          'principles.md',
          'testing.md',
        ],
      });
      files[PRINCIPLES] = `# Principles\n\n${principles}`;
      files[TESTING] = `# Testing\n\n${testing}`;
      const constitution = loadFiles(files);

      // Act
      const part = corePartOf(constitution);

      // Assert
      expect(part).toStrictEqual({
        findings: [],
        text,
      });
    },
  );

  it.each([
    {
      expected: 'Read [p](blocks/core/principles.md).',
      name: 'a link to a chapter',
      text: 'Read [p](principles.md).',
    },
    {
      expected: 'Read [p](blocks/core/principles.md#laws).',
      name: 'a link with an anchor',
      text: 'Read [p](principles.md#laws).',
    },
    {
      expected: 'Read [r](README.md).',
      name: 'a link that climbs to the root',
      text: 'Read [r](../../README.md).',
    },
    {
      expected: 'Read [r](README.md).',
      name: 'a link from the root',
      text: 'Read [r](/README.md).',
    },
    {
      expected: 'Read [p](blocks/core/principles.md#a/../b).',
      name: 'an anchor holding a slash',
      text: 'Read [p](principles.md#a/../b).',
    },
    {
      expected: '[p]: blocks/core/principles.md',
      name: 'a reference definition',
      text: '[p]: principles.md',
    },
    {
      expected: 'Read [c](#core).',
      name: 'an anchor-only link',
      text: 'Read [c](#core).',
    },
    {
      expected: 'Read [s](https://example.com).',
      name: 'an external link',
      text: 'Read [s](https://example.com).',
    },
    {
      expected: '```md\n[p](principles.md)\n```',
      name: 'a link in a fenced code block',
      text: '```md\n[p](principles.md)\n```',
    },
    {
      expected: 'Write `[p](principles.md)` as code.',
      name: 'a link in an inline code span',
      text: 'Write `[p](principles.md)` as code.',
    },
  ])(
    'should rewrite each local link from the repository root and keep the rest as written when core.md holds $name',
    ({ expected, text }) => {
      // Arrange
      const files = validFiles();
      files[CORE] = coreFile({
        body: `# Core\n\n${text}\n`,
        chapters: [
          'principles.md',
        ],
      });
      const constitution = loadFiles(files);

      // Act
      const part = corePartOf(constitution);

      // Assert
      expect(part).toStrictEqual({
        findings: [],
        text: `# Core\n\n${expected}\n\n${LAWS}\n`,
      });
    },
  );
});
