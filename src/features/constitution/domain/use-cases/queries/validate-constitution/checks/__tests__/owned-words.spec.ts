import { describe, expect, it } from 'bun:test';

import type { Finding } from '#/kernel';

import {
  checkInputOf,
  mainFile,
  textOf,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { ownedWordsCheck } from '../owned-words';

const UI = 'blocks/domains/ui/ui.md';
const PRINCIPLES = 'blocks/core/principles.md';

const named = (input: {
  owner: string;
  path: string;
  word: string;
}): Finding => ({
  message: `names "${input.word}", which ${input.owner} owns; only ${input.owner} and the blocks that depend on it may`,
  path: input.path,
});

describe('ownedWordsCheck', () => {
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

  it.each<{
    expected: Finding[];
    name: string;
    path: string;
    text: string;
  }>([
    {
      expected: [
        named({
          owner: 'typescript',
          path: UI,
          word: 'TypeScript',
        }),
        named({
          owner: 'typescript',
          path: UI,
          word: '.ts',
        }),
        named({
          owner: 'typescript',
          path: UI,
          word: 'index.ts',
        }),
      ],
      name: 'a domain names them in prose and in inline code',
      path: UI,
      text: mainFile({
        body: '# UI\n\nEach screen is one `index.ts` in TypeScript.\n',
        id: 'ui',
        kind: 'domain',
      }),
    },
    {
      expected: [
        named({
          owner: '_react',
          path: UI,
          word: 'React',
        }),
      ],
      name: 'the summary of a domain names one',
      path: UI,
      text: mainFile({
        body: '# UI\n',
        id: 'ui',
        kind: 'domain',
        summary: 'Screens written in React.',
      }),
    },
    {
      expected: [
        named({
          owner: '_react',
          path: PRINCIPLES,
          word: 'React',
        }),
      ],
      name: 'a hyphen joins one to the word before it',
      path: PRINCIPLES,
      text: '# Principles\n\nKeep a non-React fallback.\n',
    },
    {
      expected: [
        named({
          owner: '_react',
          path: PRINCIPLES,
          word: 'React',
        }),
      ],
      name: 'a hyphen joins one to the word after it',
      path: PRINCIPLES,
      text: '# Principles\n\nWrite React-based screens.\n',
    },
    {
      expected: [
        named({
          owner: '_react',
          path: PRINCIPLES,
          word: 'React',
        }),
        named({
          owner: 'react-dom',
          path: PRINCIPLES,
          word: 'React DOM',
        }),
      ],
      name: 'a line break splits one',
      path: PRINCIPLES,
      text: '# Principles\n\n- Screens render with React\n  DOM.\n',
    },
  ])('should report the owned words when $name', ({ expected, path, text }) => {
    // Arrange
    const files = validFiles();
    files[path] = text;
    const input = checkInputOf(files);

    // Act
    const findings = ownedWordsCheck(input);

    // Assert
    expect(findings).toStrictEqual(expected);
  });

  it.each([
    {
      name: 'a fenced sample of a domain holds one',
      path: UI,
      text: mainFile({
        body: '# UI\n\n```tsx\nconst Screen = (): React.ReactNode => null;\n```\n',
        id: 'ui',
        kind: 'domain',
      }),
    },
    {
      name: 'a with/ file named after the owner holds one',
      path: 'blocks/contexts/platforms/browser/with/typescript.md',
      text: '# Browser with TypeScript\n\nEach `index.ts` runs in the tab.\n',
    },
    {
      name: 'a longer word begins with one',
      path: PRINCIPLES,
      text: '# Principles\n\nThe Reactive stream flows on.\n',
    },
    {
      name: 'a dotted name ends with one',
      path: PRINCIPLES,
      text: '# Principles\n\nRead `module.React` lazily.\n',
    },
  ])('should find nothing when $name', ({ path, text }) => {
    // Arrange
    const files = validFiles();
    files[path] = text;
    const input = checkInputOf(files);

    // Act
    const findings = ownedWordsCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });
});
