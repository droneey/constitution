import { describe, expect, it } from 'bun:test';

import { ProjectRead, ProjectReadStatus } from '../presets-project.entity';

describe('ProjectRead.map', () => {
  it('should take the answer on where the project opened', () => {
    // Act
    const read = ProjectRead.map(ProjectRead.opened(2), (count) => count * 10);

    // Assert
    expect(read).toStrictEqual({
      answer: 20,
      status: ProjectReadStatus.Opened,
    });
  });

  it('should leave a read whose project did not open as it is', () => {
    // Arrange
    const unopened: ProjectRead<number> = {
      lines: [
        4,
      ],
      status: ProjectReadStatus.ConfigUnparsed,
    };

    // Act
    const read = ProjectRead.map(unopened, (count: number) => count * 10);

    // Assert
    expect(read).toBe(unopened);
  });
});
