import { PATH_SEPARATOR } from './path.constants';

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

const DRONEEY_FOLDER_NAME = '.droneey';
const releaseFolderInProject = `${DRONEEY_FOLDER_NAME}${PATH_SEPARATOR}constitution`;
// Why: beside the release's link, never under it, so what the hooks write never lands in the
// installed release.
const sessionsFolderInProject = `${DRONEEY_FOLDER_NAME}${PATH_SEPARATOR}constitution-sessions`;

export type { ListKey, RequiredConfigKey };
export {
  CHECK_KEY,
  CONFIG_FILE_NAME,
  ConfigKey,
  DRONEEY_FOLDER_NAME,
  LIST_KEYS,
  REQUIRED_CONFIG_KEYS,
  releaseFolderInProject,
  sessionsFolderInProject,
};
