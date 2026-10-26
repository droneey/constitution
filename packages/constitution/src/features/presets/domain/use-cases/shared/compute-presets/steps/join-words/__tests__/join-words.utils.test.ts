import { describe, expect, it } from 'bun:test';

import type { Contribution, PresetValue as Value } from '../../../../../../entities';
import { PresetValue } from '../../../../../../entities';
import { joinWords } from '../join-words.utils';

const from = (given: Value): Contribution => ({
  block: 'bun',
  source: 'bun',
  value: given,
});

describe('joinWords', () => {
  it('should write each list marked as words as one text, and leave a path that holds no list', () => {
    // Arrange
    const contributions = [
      from(
        PresetValue.mapOf([
          {
            key: 'scripts',
            value: PresetValue.mapOf([
              {
                key: 'check',
                value: PresetValue.wordsOf([
                  'bun run',
                ]),
              },
              {
                key: 'lint',
                value: PresetValue.wordsOf([
                  'biome',
                ]),
              },
              {
                key: 'test',
                value: PresetValue.plain([
                  'kept',
                ]),
              },
            ]),
          },
        ]),
      ),
    ];

    // Act
    const joined = joinWords({
      contributions,
      merged: {
        scripts: {
          check: [
            'bun run',
            "'check:*'",
            1,
          ],
          lint: 'biome check',
          test: [
            'kept',
          ],
        },
      },
    });

    // Assert
    expect(joined).toStrictEqual({
      scripts: {
        check: "bun run 'check:*' 1",
        lint: 'biome check',
        test: [
          'kept',
        ],
      },
    });
  });
});
