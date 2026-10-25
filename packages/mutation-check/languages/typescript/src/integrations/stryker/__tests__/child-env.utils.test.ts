import { describe, expect, it } from 'bun:test';

import { childEnvOf } from '../child-env.utils.ts';

const ACTIVE_MUTANT = '__STRYKER_ACTIVE_MUTANT__';

const variables = (
  entries: readonly (readonly [
    string,
    string,
  ])[],
): Readonly<Record<string, string>> => Object.fromEntries(entries);

describe('childEnvOf', () => {
  it.each([
    {
      condition: 'the environment holds each of them',
      env: variables([
        [
          ACTIVE_MUTANT,
          '7',
        ],
        [
          'HOME',
          '/home/dev',
        ],
        [
          'PATH',
          '/usr/bin',
        ],
        [
          'TMPDIR',
          '/tmp/dev',
        ],
      ]),
      environment: variables([
        [
          'HOME',
          '/home/dev',
        ],
        [
          'NPM_TOKEN',
          'secret',
        ],
        [
          'PATH',
          '/usr/bin',
        ],
        [
          'TMPDIR',
          '/tmp/dev',
        ],
      ]),
    },
    {
      condition: 'the environment lacks one',
      env: variables([
        [
          ACTIVE_MUTANT,
          '7',
        ],
        [
          'PATH',
          '/usr/bin',
        ],
      ]),
      environment: variables([
        [
          'PATH',
          '/usr/bin',
        ],
      ]),
    },
  ])(
    'should keep only the variables the specs need, beside its own, when $condition',
    ({ env, environment }) => {
      // Act
      const built = childEnvOf({
        environment,
        own: variables([
          [
            ACTIVE_MUTANT,
            '7',
          ],
        ]),
      });

      // Assert
      expect(built).toStrictEqual(env);
    },
  );
});
