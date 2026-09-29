import { describe, expect, it } from 'bun:test';

import { licenceViolations } from './osv-scanner-preset.fixtures';

// osv-scanner asks deps.dev for every licence, which a CI runner may take longer to answer.
const NETWORK_TIMEOUT_MS = 60_000;

describe('the osv-scanner licence allowlist', () => {
  it(
    'should report a package when its licence is not on the list',
    () => {
      // Arrange
      const packages = {
        'is-number': '7.0.0',
        'left-pad': '1.3.0',
      };

      // Act
      const found = licenceViolations(packages);

      // Assert
      expect(found).toStrictEqual([
        'left-pad',
      ]);
    },
    NETWORK_TIMEOUT_MS,
  );

  it(
    'should report nothing when every licence is permissive',
    () => {
      // Arrange
      const packages = {
        'caniuse-lite': '1.0.30001812',
        'is-number': '7.0.0',
        typescript: '5.9.2',
      };

      // Act
      const found = licenceViolations(packages);

      // Assert
      expect(found).toStrictEqual([]);
    },
    NETWORK_TIMEOUT_MS,
  );
});
