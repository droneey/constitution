import type { ConfigOverride, ConfigRead, ProjectConfig } from '../../../domain/entities';
import { ConfigReadStatus } from '../../../domain/entities';

// constitution.yaml read whole: nothing in it unless the overrides give it.
const parsedConfigOf = (overrides: Partial<ProjectConfig> = {}): ConfigRead => ({
  config: {
    apps: [],
    empties: [],
    items: [],
    keys: [],
    lists: [],
    overrides: [],
    ...overrides,
  },
  status: ConfigReadStatus.Parsed,
});

// An override of the repository on the first line, every field left out unless the overrides give it.
const overrideOf = (overrides: Partial<ConfigOverride> = {}): ConfigOverride => ({
  app: '',
  level: '',
  line: 1,
  reason: '',
  rule: '',
  until: '',
  ...overrides,
});

export { overrideOf, parsedConfigOf };
