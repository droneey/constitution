/** The file a project and each member of its workspace declare their blocks in. */
const CONFIG_FILE_NAME = 'constitution.yaml';

/** A key older releases read, which the warning of an unknown key now names apart. */
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

/** The keys whose value is a list, in the order a file writes them. */
const LIST_KEYS = [
  ConfigKey.Axes,
  ConfigKey.Domains,
  ConfigKey.Platforms,
  ConfigKey.Languages,
  ConfigKey.Implementations,
  ConfigKey.Packs,
] as const;

type ListKey = (typeof LIST_KEYS)[number];

/**
 * The keys a unit's constitution.yaml must give, in the order a file writes them: every one but
 * name, which no unit is asked for.
 */
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

/** Where a project links the release it pins, from its folder. */
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
