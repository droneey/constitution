import { describe, expect, it } from 'bun:test';

import { mutantNames } from './mutmut-preset.fixtures';

// mutmut takes a key it does not know without a word, so each exclusion the presets set has a
// module it must leave alone.
describe("the configuration mutmut's presets write", () => {
  it('should make mutants only of the code outside messages modules and calls to the logger when a unit follows every block mutmut is configured for', async () => {
    // Act
    const names = await mutantNames();

    // Assert
    expect(names).toStrictEqual([
      'unit.orders.x_total__mutmut_1',
    ]);
  });
});
