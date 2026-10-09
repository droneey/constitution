import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel/constants';

import { axisFolderOf, axisNameOf } from '../axes.utils';

describe('axes', () => {
  it.each([
    {
      axis: Axis.Foundation,
      expected: '',
    },
    {
      axis: Axis.Architecture,
      expected: 'architecture/',
    },
  ])('should give the folder "$expected" when the axis is $axis', ({ axis, expected }) => {
    // Arrange
    const input = axis;

    // Act
    const folder = axisFolderOf(input);

    // Assert
    expect(folder).toBe(expected);
  });

  it.each([
    {
      axis: Axis.Foundation,
      expected: 'the base',
    },
    {
      axis: Axis.Workflow,
      expected: 'workflow',
    },
  ])('should give the name "$expected" when the axis is $axis', ({ axis, expected }) => {
    // Arrange
    const input = axis;

    // Act
    const name = axisNameOf(input);

    // Assert
    expect(name).toBe(expected);
  });
});
