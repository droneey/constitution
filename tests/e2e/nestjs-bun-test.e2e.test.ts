import { describe, expect, it } from 'bun:test';

import { decoratedSpecPasses } from './nestjs-bun-test.fixtures.ts';

describe('NestJS specs under Bun test', () => {
  it('should run a decorated spec when tsconfig.json writes the decorator options', () => {
    // Arrange
    const project = {
      hasOwnOptions: true,
    };

    // Act
    const passes = decoratedSpecPasses(project);

    // Assert
    expect(passes).toBe(true);
  });

  // When Bun follows an extends array, this case fails and the rule can go.
  it('should fail a decorated spec when the options come only through the extends array', () => {
    // Arrange
    const project = {
      hasOwnOptions: false,
    };

    // Act
    const passes = decoratedSpecPasses(project);

    // Assert
    expect(passes).toBe(false);
  });
});
