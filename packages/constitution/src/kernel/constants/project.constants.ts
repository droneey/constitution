const CONFIG_FILE_NAME = 'constitution.yaml';

// Why: older releases read this key, which the warning of an unknown key now names apart.
const CHECK_KEY = 'check';

enum ConfigKey {
  Name = 'name',
  Axes = 'axes',
  Domains = 'domains',
  Platforms = 'platforms',
  Languages = 'languages',
  Implementations = 'implementations',
  Packs = 'packs',
  Overrides = 'overrides',
}

const LIST_KEYS = [
  ConfigKey.Axes,
  ConfigKey.Domains,
  ConfigKey.Platforms,
  ConfigKey.Languages,
  ConfigKey.Implementations,
  ConfigKey.Packs,
] as const;

type ListKey = (typeof LIST_KEYS)[number];

const REQUIRED_CONFIG_KEYS = [
  ConfigKey.Axes,
  ConfigKey.Domains,
  ConfigKey.Platforms,
  ConfigKey.Languages,
  ConfigKey.Implementations,
  ConfigKey.Packs,
  ConfigKey.Overrides,
] as const;

type RequiredConfigKey = (typeof REQUIRED_CONFIG_KEYS)[number];

const RELEASE_FOLDER_PATH = '.droneey/constitution';

export type { ListKey, RequiredConfigKey };
export {
  CHECK_KEY,
  CONFIG_FILE_NAME,
  ConfigKey,
  LIST_KEYS,
  RELEASE_FOLDER_PATH,
  REQUIRED_CONFIG_KEYS,
};
