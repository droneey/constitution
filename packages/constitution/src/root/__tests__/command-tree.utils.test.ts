import { describe, expect, it } from 'bun:test';

import { Command } from 'commander';

import { createFakeContext } from '#/__tests__/command-context.fake';

import { adopt, flagsOf, groupOf } from '../command-tree.utils';

describe('flagsOf', () => {
  it.each([
    {
      condition: 'the run gives every flag',
      flags: {
        colour: false,
        motion: true,
        plain: true,
      },
      opts: {
        color: false,
        motion: true,
        plain: true,
      },
    },
    {
      condition: 'the run gives none',
      flags: {},
      opts: {},
    },
  ])(
    'should give the output flags as the design system takes them when $condition',
    ({ flags, opts }) => {
      // Act
      const given = flagsOf(opts);

      // Assert
      expect(given).toStrictEqual(flags);
    },
  );
});

describe('adopt', () => {
  it("should add each child to its parent with the parent's settings", () => {
    // Arrange
    const written: string[] = [];
    const parent = new Command('constitution').configureOutput({
      writeOut: (text: string): void => {
        written.push(text);
      },
    });
    const child = new Command('apply');

    // Act
    const adopted = adopt(parent, [
      child,
    ]);

    // Assert
    expect({
      children: adopted.commands.map((command) => command.name()),
      writesThroughParent: child.configureOutput().writeOut === parent.configureOutput().writeOut,
    }).toStrictEqual({
      children: [
        'apply',
      ],
      writesThroughParent: true,
    });
  });
});

describe('groupOf', () => {
  it("should name a group, describe it and open its help with its examples, with the parent's settings", () => {
    // Arrange
    const { context } = createFakeContext();
    const written: string[] = [];
    const parent = new Command('constitution').configureOutput({
      writeOut: (text: string): void => {
        written.push(text);
      },
    });
    const group = groupOf({
      context,
      description: 'presets',
      examples: [
        'constitution presets apply',
      ],
      name: 'presets',
      parent,
    });

    // Act
    group.outputHelp();

    // Assert
    expect({
      description: group.description(),
      first: written[0],
      name: group.name(),
    }).toStrictEqual({
      description: 'presets',
      first: 'constitution presets apply\n',
      name: 'presets',
    });
  });
});
