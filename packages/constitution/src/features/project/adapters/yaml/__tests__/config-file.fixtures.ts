import { ConfigReadStatus } from '#/kernel/entities';

import type { ConfigRead, DeclaredUnit } from '../../../domain/entities';
import { ConfigOverride } from '../../../domain/entities';

// constitution.yaml read whole: nothing in it unless the overrides give it.
const parsedConfigOf = (overrides: Partial<DeclaredUnit['config']> = {}): ConfigRead => ({
  config: {
    empties: [],
    items: [],
    keys: [],
    overrides: [],
    ...overrides,
  },
  status: ConfigReadStatus.Parsed,
});

// An override on the first line, every field left out unless the overrides give it.
const overrideOf = (overrides: Partial<ConfigOverride> = {}): ConfigOverride =>
  ConfigOverride.create({
    level: overrides.level,
    line: overrides.line ?? 1,
    reason: overrides.reason,
    rule: overrides.rule,
    until: overrides.until,
  });

export { overrideOf, parsedConfigOf };
