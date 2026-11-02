import { describe, expect, it } from 'bun:test';

import { ToolKind, toolKindOf } from '../tool-kind.utils';

describe('toolKindOf', () => {
  it.each([
    {
      kind: ToolKind.Editing,
      name: 'Edit',
    },
    {
      kind: ToolKind.Editing,
      name: 'MultiEdit',
    },
    {
      kind: ToolKind.Editing,
      name: 'NotebookEdit',
    },
    {
      kind: ToolKind.Editing,
      name: 'Write',
    },
    {
      kind: ToolKind.Reading,
      name: 'Read',
    },
    {
      kind: ToolKind.Shell,
      name: 'Bash',
    },
    {
      kind: ToolKind.Spawning,
      name: 'Task',
    },
    {
      kind: ToolKind.Mcp,
      name: 'mcp__docs__create_page',
    },
    {
      kind: ToolKind.Mcp,
      name: 'mcp__docs__list_pages',
    },
    {
      kind: ToolKind.Ungated,
      name: 'Grep',
    },
    {
      kind: ToolKind.Ungated,
      name: 'create_page',
    },
  ])('should take $name for $kind', ({ kind, name }) => {
    // Act
    const taken = toolKindOf(name);

    // Assert
    expect(taken).toBe(kind);
  });
});
