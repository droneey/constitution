import { describe, expect, it } from 'bun:test';

import { TreePath } from '../../../shared/value-objects';
import { Agent, Skill } from '../skill.entity';

describe('Skill.directoryOf', () => {
  it.each([
    {
      expected: 'skills/',
      name: 'a skill sits in a folder of skills',
      path: 'skills/check/SKILL.md',
    },
    {
      expected: undefined,
      name: 'a folder on its way is hidden',
      path: '.claude/skills/check/SKILL.md',
    },
    {
      expected: undefined,
      name: 'the file is not SKILL.md',
      path: 'skills/check/README.md',
    },
  ])('should give $expected when $name', ({ expected, path }) => {
    // Arrange
    const treePath = TreePath.create(path);

    // Act
    const directory = Skill.directoryOf(treePath);

    // Assert
    expect(directory).toBe(expected);
  });
});

describe('Agent.fileOf', () => {
  it.each([
    {
      expected: 'reviewer',
      name: 'the file sits directly in agents/',
      path: 'agents/reviewer.md',
    },
    {
      expected: undefined,
      name: 'the file is nested',
      path: 'agents/team/reviewer.md',
    },
    {
      expected: undefined,
      name: 'the file is hidden',
      path: 'agents/.reviewer.md',
    },
  ])('should give $expected when $name', ({ expected, path }) => {
    // Arrange
    const treePath = TreePath.create(path);

    // Act
    const file = Agent.fileOf(treePath);

    // Assert
    expect(file).toBe(expected);
  });
});
