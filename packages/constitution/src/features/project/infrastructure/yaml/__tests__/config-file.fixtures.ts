import { ConfigReadStatus } from '#/kernel/entities';

import type { ConfigRead, DeclaredUnit } from '../../../domain/project-config/entities';
import { ConfigOverride } from '../../../domain/project-config/entities';

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

const overrideOf = (overrides: Partial<ConfigOverride> = {}): ConfigOverride =>
  ConfigOverride.create({
    level: overrides.level,
    line: overrides.line ?? 1,
    reason: overrides.reason,
    rule: overrides.rule,
    until: overrides.until,
  });

export { overrideOf, parsedConfigOf };
