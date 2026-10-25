import { describe, expect, it } from 'bun:test';

import { isUsageError, UsageFailure } from '../../errors';
import { baseFlagsOf, outputFlagsOf } from '../flags.utils';

// The code of the UsageError an act throws and the option each of its problems names; undefined
// when it throws none.
const refusalOf = (act: () => unknown): unknown => {
  try {
    act();

    return undefined;
  } catch (error) {
    if (!isUsageError(error)) {
      throw error;
    }

    return {
      code: error.code,
      name: error.name,
      options: error.details.problems.map((problem) => problem.slice(0, problem.indexOf(':'))),
    };
  }
};

describe('baseFlagsOf and outputFlagsOf', () => {
  it.each([
    {
      condition: 'the --base a command takes is given',
      expected: {
        base: '.droneey/constitution',
      },
      flagsOf: baseFlagsOf,
      opts: {
        base: '.droneey/constitution',
      },
    },
    {
      condition: 'no --base is given',
      expected: {},
      flagsOf: baseFlagsOf,
      opts: {},
    },
    {
      condition: 'the output flags are given',
      expected: {
        color: false,
        motion: true,
        plain: true,
      },
      flagsOf: outputFlagsOf,
      opts: {
        color: false,
        motion: true,
        plain: true,
      },
    },
  ])('should give the flags when $condition', ({ expected, flagsOf, opts }) => {
    // Act
    const flags = flagsOf(opts);

    // Assert
    expect(flags).toStrictEqual(expected);
  });

  it.each([
    {
      condition: 'the --base is no text',
      flagsOf: baseFlagsOf,
      opts: {
        base: 1,
      },
      option: 'base',
    },
    {
      condition: 'an output flag is no switch',
      flagsOf: outputFlagsOf,
      opts: {
        plain: 'yes',
      },
      option: 'plain',
    },
  ])(
    'should refuse the options with a usage error naming the option when $condition',
    ({ flagsOf, opts, option }) => {
      // Act
      const refusal = refusalOf(() => flagsOf(opts));

      // Assert
      expect(refusal).toStrictEqual({
        code: UsageFailure.OptionsUnparsed,
        name: 'UsageError',
        options: [
          option,
        ],
      });
    },
  );
});
