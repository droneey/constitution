import { describe, expect, it } from 'bun:test';

import { checkDeployed, deployedUnits, listedBlocks, releaseBlocks } from './every-block.fixtures';

describe('a deployment of every block', () => {
  it('should list every block of the release in one of its units', () => {
    // Act
    const listed = listedBlocks();

    // Assert
    expect(listed).toStrictEqual(releaseBlocks());
  });

  it.each(deployedUnits)(
    'should pass every tool of the $name unit over the files apply writes',
    async (deployed) => {
      // Act
      const failures = await checkDeployed(deployed);

      // Assert
      expect(failures).toStrictEqual([]);
    },
  );
});
