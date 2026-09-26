import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  mainFile,
  textOf,
} from '#/features/constitution/__tests__/fixtures';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import { ownedWordsCheck } from '../owned-words';

const UI = 'blocks/domains/ui/ui.md';
const PRINCIPLES = 'blocks/core/principles.md';

const nameMessage = (input: { owner: string; word: string }): string =>
  `names "${input.word}", which ${input.owner} owns; only ${input.owner} and the blocks that depend on it may`;

describe('ownedWordsCheck', () => {
  it('should find nothing when the constitution is valid', () => {
    // Arrange
    const input = checkInputOf(validFiles());

    // Act
    const findings = ownedWordsCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report a word when a second block owns it too', () => {
    // Arrange
    const files = validFiles();
    files['blocks/implementations/lingui/lingui.md'] = textOf({
      files,
      path: 'blocks/implementations/lingui/lingui.md',
    }).replace('owns: ["Lingui"]', 'owns: ["Lingui","Biome"]');
    const input = checkInputOf(files);

    // Act
    const findings = ownedWordsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'owns "Biome", which biome owns already',
        path: 'blocks/implementations/lingui/lingui.md',
      },
    ]);
  });

  it('should report every owned word when a domain names them in prose and inline code', () => {
    // Arrange
    const files = validFiles();
    files[UI] = mainFile({
      body: '# UI\n\nEach screen is one `index.ts` in TypeScript.\n',
      id: 'ui',
      kind: 'domain',
    });
    const input = checkInputOf(files);

    // Act
    const findings = ownedWordsCheck(input);

    // Assert
    expect(findings.map((finding) => finding.message)).toStrictEqual([
      nameMessage({
        owner: 'typescript',
        word: 'TypeScript',
      }),
      nameMessage({
        owner: 'typescript',
        word: '.ts',
      }),
      nameMessage({
        owner: 'typescript',
        word: 'index.ts',
      }),
    ]);
  });

  it.each([
    {
      name: 'a hyphenated compound in core',
      path: PRINCIPLES,
      text: '# Principles\n\nKeep a non-React fallback.\n',
    },
    {
      name: 'the summary of a domain',
      path: UI,
      text: mainFile({
        body: '# UI\n',
        id: 'ui',
        kind: 'domain',
        summary: 'Screens written in React.',
      }),
    },
  ])('should report React when it appears in $name', ({ path, text }) => {
    // Arrange
    const files = validFiles();
    files[path] = text;
    const input = checkInputOf(files);

    // Act
    const findings = ownedWordsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: nameMessage({
          owner: '_react',
          word: 'React',
        }),
        path,
      },
    ]);
  });

  it.each([
    {
      name: 'a fenced sample of a domain',
      path: UI,
      text: mainFile({
        body: '# UI\n\n```tsx\nconst Screen = (): React.ReactNode => null;\n```\n',
        id: 'ui',
        kind: 'domain',
      }),
    },
    {
      name: 'a with/ file named after the owner',
      path: 'blocks/contexts/platforms/browser/with/typescript.md',
      text: '# Browser with TypeScript\n\nEach `index.ts` runs in the tab.\n',
    },
  ])(
    'should accept an owned word when it appears in $name',
    ({ path, text }) => {
      // Arrange
      const files = validFiles();
      files[path] = text;
      const input = checkInputOf(files);

      // Act
      const findings = ownedWordsCheck(input);

      // Assert
      expect(findings).toStrictEqual([]);
    },
  );
});
