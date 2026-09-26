import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  mainFile,
  rule,
} from '#/features/constitution/__tests__/fixtures';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import { abstractBlocksCheck } from '../abstract-blocks';

const REACT = 'blocks/implementations/_react/_react.md';

const reactBase = (input: { body: string; summary?: string }): string =>
  mainFile({
    abstract: true,
    body: input.body,
    id: '_react',
    kind: 'implementation',
    owns: [
      'React',
    ],
    requires: [
      'ui',
    ],
    ...(input.summary === undefined
      ? {}
      : {
          summary: input.summary,
        }),
  });

describe('abstractBlocksCheck', () => {
  it('should find nothing when the constitution is valid', () => {
    // Arrange
    const input = checkInputOf(validFiles());

    // Act
    const findings = abstractBlocksCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should report an abstract block when nothing extends it', () => {
    // Arrange
    const files = validFiles();
    files['blocks/implementations/react-dom/react-dom.md'] = mainFile({
      body: '# React DOM\n',
      id: 'react-dom',
      kind: 'implementation',
      requires: [
        'browser',
        '_react',
      ],
    });
    const input = checkInputOf(files);

    // Act
    const findings = abstractBlocksCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'is abstract and has no heir',
        path: REACT,
      },
    ]);
  });

  it.each([
    {
      name: 'its body',
      text: reactBase({
        body: `# React\n\nUnlike react-dom, a base knows no renderer.\n\n${rule(
          {
            slug: 'hooks-at-top-level',
          },
        )}`,
      }),
    },
    {
      name: 'its summary',
      text: reactBase({
        body: '# React\n',
        summary: 'React as react-dom and others share it.',
      }),
    },
  ])('should report the heir when the base names it in $name', ({ text }) => {
    // Arrange
    const files = validFiles();
    files[REACT] = text;
    const input = checkInputOf(files);

    // Act
    const findings = abstractBlocksCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message: 'names its heir react-dom; a base knows nothing of its heirs',
        path: REACT,
      },
    ]);
  });

  it('should report a with/ file of the base when it is named after an heir', () => {
    // Arrange
    const files = validFiles();
    files['blocks/implementations/_react/with/react-dom.md'] =
      '# Seam\n\nPortals.\n';
    const input = checkInputOf(files);

    // Act
    const findings = abstractBlocksCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        message:
          'is a with/ file named after the heir react-dom; a base knows nothing of its heirs',
        path: 'blocks/implementations/_react/with/react-dom.md',
      },
    ]);
  });
});
