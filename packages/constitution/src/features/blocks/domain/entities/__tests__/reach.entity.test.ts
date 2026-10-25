import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel/constants';

import { mayReachAxis } from '../reach.entity';

describe('mayReachAxis', () => {
  it.each([
    {
      expected: true,
      from: Axis.Architecture,
      to: Axis.Architecture,
    },
    {
      expected: true,
      from: Axis.Workflow,
      to: Axis.Foundation,
    },
    {
      expected: false,
      from: Axis.Architecture,
      to: Axis.Workflow,
    },
    {
      expected: false,
      from: Axis.Foundation,
      to: Axis.Architecture,
    },
  ])('should answer $expected when $from refers to $to', ({ expected, from, to }) => {
    // Arrange
    const reference = {
      from,
      to,
    };

    // Act
    const reaches = mayReachAxis(reference);

    // Assert
    expect(reaches).toBe(expected);
  });
});
