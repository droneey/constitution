import { describe, expect, it } from 'bun:test';

import type { Finding } from '#/kernel/types';

import {
  checkInputOf,
  findingOf,
  passportFile,
  textOf,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { ownedWordsCheck } from '../owned-words.check';

const UI = 'blocks/domains/ui/ui.md';
const UI_CHAPTER = 'blocks/domains/ui/foundation/forms.md';
const PRINCIPLES = 'blocks/core/foundation/principles.md';

const named = (input: { owner: string; path: string; word: string }): Finding =>
  findingOf({
    code: 'owned-word-out-of-reach',
    names: [
      input.word,
      input.owner,
    ],
    path: input.path,
  });

describe('ownedWordsCheck', () => {
  it('should report a word when a second block owns it too', () => {
    // Arrange
    const files = validFiles();
    files['blocks/implementations/lingui/lingui.md'] = textOf({
      files,
      path: 'blocks/implementations/lingui/lingui.md',
    }).replace('dictionary: ["Lingui"]', 'dictionary: ["Lingui","Biome"]');
    const input = checkInputOf(files);

    // Act
    const findings = ownedWordsCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      findingOf({
        code: 'word-owned-twice',
        names: [
          'Biome',
          'biome',
        ],
        path: 'blocks/implementations/lingui/lingui.md',
      }),
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
          path: UI_CHAPTER,
          word: 'TypeScript',
        }),
        named({
          owner: 'typescript',
          path: UI_CHAPTER,
          word: '.ts',
        }),
        named({
          owner: 'typescript',
          path: UI_CHAPTER,
          word: 'index.ts',
        }),
      ],
      name: 'a domain names them in prose and in inline code',
      path: UI_CHAPTER,
      text: '# UI\n\nEach screen is one `index.ts` in TypeScript.\n',
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
      text: passportFile({
        body: '# UI\n',
        id: 'ui',
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
      path: UI_CHAPTER,
      text: '# UI\n\n```tsx\nconst Screen = (): React.ReactNode => null;\n```\n',
    },
    {
      name: 'a with/ file named after the owner holds one',
      path: 'blocks/contexts/platforms/browser/foundation/with/typescript.md',
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
