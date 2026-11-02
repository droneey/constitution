import { describe, expect, it } from 'bun:test';

import { agentFilesOfMember, importsOf, pointersOf } from './core-preset.fixtures';

describe("the agent files core's presets write", () => {
  it.each([
    {
      file: 'AGENTS.md',
      imports: [
        'PROJECT.md',
      ],
    },
    {
      file: 'CLAUDE.md',
      imports: [
        'AGENTS.md',
      ],
    },
  ])(
    'should import in $file the file its agent reads next when a unit is the repository root',
    ({ file, imports }) => {
      // Act
      const imported = importsOf(file);

      // Assert
      expect(imported).toStrictEqual(imports);
    },
  );

  it("should point AGENTS.md only to files the unit holds, the release's core.md among them, when a unit is the repository root", () => {
    // Act
    const pointers = pointersOf('AGENTS.md');

    // Assert
    expect(pointers).toStrictEqual({
      '.droneey/constitution/blocks/core/core.md': true,
      'constitution.yaml': true,
    });
  });

  it('should write no agent file into a member when a unit is a member of a workspace', () => {
    // Act
    const written = agentFilesOfMember();

    // Assert
    expect(written).toStrictEqual([]);
  });
});
