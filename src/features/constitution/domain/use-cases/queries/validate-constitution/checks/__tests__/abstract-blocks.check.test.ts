import { describe, expect, it } from 'bun:test';

import type { Files } from '../../../../../../__tests__/constitution.fixtures';
import {
  checkInputOf,
  mainFile,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { abstractBlocksCheck } from '../abstract-blocks.check';

const REACT = 'blocks/implementations/_react/_react.md';

const reactBase = (input: { body: string; summary: string }): string =>
  mainFile({
    abstract: true,
    body: input.body,
    id: '_react',
    kind: 'implementation',
    summary: input.summary,
  });

describe('abstractBlocksCheck', () => {
  it('should report an abstract block when nothing extends it', () => {
    // Arrange
    const files = validFiles();
    files['blocks/implementations/react-dom/react-dom.md'] = mainFile({
      body: '# React DOM\n',
      id: 'react-dom',
      kind: 'implementation',
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

  it.each<{
    files: Files;
    name: string;
  }>([
    {
      files: {
        [REACT]: reactBase({
          body: '# React\n\nUnlike react-dom, a base knows no renderer.\n',
          summary: 'The React base.',
        }),
      },
      name: 'its body',
    },
    {
      files: {
        [REACT]: reactBase({
          body: '# React\n',
          summary: 'The base of react-dom.',
        }),
        'blocks/implementations/_react/with/browser.md':
          '# React in the browser\n',
      },
      name: 'its summary, which its other files do not repeat',
    },
  ])(
    'should report the heir at the main file when the base names it in $name',
    ({ files }) => {
      // Arrange
      const input = checkInputOf({
        ...validFiles(),
        ...files,
      });

      // Act
      const findings = abstractBlocksCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        {
          message:
            'names its heir react-dom; a base knows nothing of its heirs',
          path: REACT,
        },
      ]);
    },
  );

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

  it.each([
    'react-dom-extra',
    'x-react-dom',
  ])(
    'should accept a base when it names %p, which only holds the id of its heir',
    (id) => {
      // Arrange
      const files = validFiles();
      files[REACT] = reactBase({
        body: `# React\n\nUnlike ${id}, a base knows no renderer.\n`,
        summary: 'The React base.',
      });
      const input = checkInputOf(files);

      // Act
      const findings = abstractBlocksCheck(input);

      // Assert
      expect(findings).toStrictEqual([]);
    },
  );
});
