import { describe, expect, it } from 'bun:test';

import type { Files } from '../../../../../../__tests__/constitution.fixtures';
import {
  checkInputOf,
  mainFile,
} from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { cyclesCheck } from '../cycles';

const requiring = (input: {
  id: string;
  requires: readonly string[];
}): Files => ({
  [`blocks/implementations/${input.id}/${input.id}.md`]: mainFile({
    body: `# ${input.id}\n`,
    id: input.id,
    kind: 'implementation',
    requires: input.requires,
  }),
});

describe('cyclesCheck', () => {
  it.each([
    {
      files: {
        ...requiring({
          id: 'biome',
          requires: [
            '_react',
            'lingui',
          ],
        }),
        ...requiring({
          id: 'lingui',
          requires: [
            'biome',
          ],
        }),
      },
      name: 'two implementations require each other, one through its last requirement',
    },
    {
      files: {
        ...requiring({
          id: 'biome',
          requires: [
            'lingui',
          ],
        }),
        ...requiring({
          id: 'lingui',
          requires: [
            'biome',
          ],
        }),
        ...requiring({
          id: 'react-dom',
          requires: [
            'biome',
          ],
        }),
      },
      name: 'another implementation requires a block of the loop',
    },
  ])(
    'should report the cycle once, at its first block, when $name',
    ({ files }) => {
      // Arrange
      const input = checkInputOf({
        ...validFiles(),
        ...files,
      });

      // Act
      const findings = cyclesCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        {
          message: 'is part of a dependency cycle: biome → lingui → biome',
          path: 'blocks/implementations/biome/biome.md',
        },
      ]);
    },
  );

  it.each([
    {
      files: requiring({
        id: 'biome',
        requires: [
          '_react',
          'react-dom',
        ],
      }),
      name: 'two implementations share a dependency',
    },
    {
      files: requiring({
        id: 'biome',
        requires: [
          'biome',
        ],
      }),
      name: 'an implementation requires itself',
    },
    {
      files: requiring({
        id: 'biome',
        requires: [
          'webgl',
        ],
      }),
      name: 'an implementation requires an id that is no block',
    },
    {
      files: {
        'blocks/contexts/platforms/browser/browser.md': mainFile({
          body: '# Browser\n',
          id: 'browser',
          kind: 'context',
          requires: [
            'react-dom',
          ],
        }),
      },
      name: 'the loop runs through a platform',
    },
  ])('should find no cycle when $name', ({ files }) => {
    // Arrange
    const input = checkInputOf({
      ...validFiles(),
      ...files,
    });

    // Act
    const findings = cyclesCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });
});
