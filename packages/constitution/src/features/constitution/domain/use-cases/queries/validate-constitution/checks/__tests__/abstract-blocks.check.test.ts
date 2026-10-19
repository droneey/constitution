import { describe, expect, it } from 'bun:test';

import type { Files } from '../../../../../../__tests__/constitution.fixtures';
import {
  checkInputOf,
  findingOf,
  passportFile,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { abstractBlocksCheck } from '../abstract-blocks.check';

const REACT = 'blocks/implementations/_react/_react.md';
const REACT_CHAPTER = 'blocks/implementations/_react/foundation/renderers.md';

const reactBase = (input: { body: string; summary: string }): string =>
  passportFile({
    abstract: true,
    body: input.body,
    id: '_react',
    summary: input.summary,
  });

describe('abstractBlocksCheck', () => {
  it('should report an abstract block when nothing extends it', () => {
    // Arrange
    const files = validFiles();
    files['blocks/implementations/react-dom/react-dom.md'] = passportFile({
      body: '# React DOM\n',
      id: 'react-dom',
    });
    const input = checkInputOf(files);

    // Act
    const findings = abstractBlocksCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      findingOf({
        code: 'abstract-block-without-heir',
        path: REACT,
      }),
    ]);
  });

  it.each<{
    files: Files;
    name: string;
    path: string;
  }>([
    {
      files: {
        [REACT_CHAPTER]: '# React\n\nUnlike react-dom, a base knows no renderer.\n',
      },
      name: 'a chapter of an axis',
      path: REACT_CHAPTER,
    },
    {
      files: {
        [REACT]: reactBase({
          body: '# React\n',
          summary: 'The base of react-dom.',
        }),
        'blocks/implementations/_react/foundation/with/browser.md': '# React in the browser\n',
      },
      name: 'the summary of its passport, which its other files do not repeat',
      path: REACT,
    },
  ])(
    'should report the file that names the heir when the base names it in $name',
    ({ files, path }) => {
      // Arrange
      const input = checkInputOf({
        ...validFiles(),
        ...files,
      });

      // Act
      const findings = abstractBlocksCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        findingOf({
          code: 'base-names-heir',
          names: [
            'react-dom',
          ],
          path,
        }),
      ]);
    },
  );

  it('should report a with/ file of the base when it is named after an heir', () => {
    // Arrange
    const files = validFiles();
    files['blocks/implementations/_react/architecture/with/react-dom.md'] = '# Seam\n\nPortals.\n';
    const input = checkInputOf(files);

    // Act
    const findings = abstractBlocksCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      findingOf({
        code: 'base-seam-named-after-heir',
        names: [
          'react-dom',
        ],
        path: 'blocks/implementations/_react/architecture/with/react-dom.md',
      }),
    ]);
  });

  it.each([
    'react-dom-extra',
    'x-react-dom',
  ])('should accept a base when it names %p, which only holds the id of its heir', (id) => {
    // Arrange
    const files = validFiles();
    files[REACT_CHAPTER] = `# React\n\nUnlike ${id}, a base knows no renderer.\n`;
    const input = checkInputOf(files);

    // Act
    const findings = abstractBlocksCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });
});
