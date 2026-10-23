import { Axis, Layer } from '#/kernel/constants';

import type { ConfigItem, ConfigPlace, ProjectConfig } from '../../../entities';
import { WarningCode } from '../../../entities';
import type { ProjectModel, Scope, Scopes } from './project-model.utils';
import { basesOf, heirsOf, keyOfLayer, layerOfKey, OPTIONAL_AXES } from './project-model.utils';
import type { WarningLog } from './warning-log.utils';

const KEYS: readonly string[] = [
  'axes',
  'domains',
  'platforms',
  'languages',
  'implementations',
  'packages',
  'packs',
  'check',
  'overrides',
];
const AXES_KEY = 'axes';
const PACKS_KEY = 'packs';
const CONFIG = 'constitution.yaml';
const CORE = 'core';
const ADD: Readonly<Record<string, string>> = {
  axes: 'axes: [architecture, workflow]',
  check: 'check: <the command that runs every check, or null>',
  overrides: 'overrides: []',
  packages: 'packages: {}',
  packs: 'packs: []',
};
const FILL: Readonly<Record<string, string>> = {
  axes: 'write axes: [architecture, workflow], or axes: [] for neither',
  check: 'name the command that runs every check, or write check: null',
  overrides: 'write overrides: []',
  packages: 'write packages: {}',
  packs: 'write packs: []',
};
// core is always active, so it is never named by its layer
const ARTICLE: Readonly<Record<Exclude<Layer, Layer.Core>, string>> = {
  [Layer.Domain]: 'a domain',
  [Layer.Implementation]: 'an implementation',
  [Layer.Language]: 'a language',
  [Layer.Platform]: 'a platform',
};

const checkKeys = (input: { config: ProjectConfig; log: WarningLog }): void => {
  const { config, log } = input;

  for (const key of KEYS) {
    if (!config.keys.includes(key)) {
      log.add({
        code: WarningCode.Config,
        message: `${CONFIG} has no ${key} key — add ${ADD[key] ?? `${key}: []`}`,
      });
    }
  }

  for (const key of config.keys) {
    if (!KEYS.includes(key)) {
      log.add({
        code: WarningCode.Config,
        message: `${CONFIG} has the unknown key ${key} — remove it`,
      });
    }
  }

  for (const empty of config.empties) {
    log.add({
      code: WarningCode.Config,
      message: `${empty.app === '' ? CONFIG : empty.app} leaves ${empty.key} empty — ${FILL[empty.key] ?? `write ${empty.key}: []`}`,
    });
  }
};

// The optional axes a scope's axes list picks, with a warning for any other name it gives.
const pickedAxesOf = (input: {
  config: ProjectConfig;
  log: WarningLog;
  scope: Scope;
}): ReadonlySet<string> => {
  const { log, scope } = input;
  const picked = new Set<string>();

  for (const listed of input.config.items.filter(
    (entry) => entry.key === AXES_KEY && entry.app === scope.app,
  )) {
    if (listed.text === Axis.Foundation) {
      log.add({
        code: WarningCode.Config,
        message: `${scope.index === 0 ? CONFIG : scope.app} lists foundation in axes — foundation is always followed, remove it`,
      });
    } else if (OPTIONAL_AXES.some((axis) => axis === listed.text)) {
      picked.add(listed.text);
    } else {
      log.add({
        code: WarningCode.Config,
        message: `axes names ${listed.text} — write architecture or workflow`,
      });
    }
  }

  return picked;
};

// foundation is always followed; axes lists the optional ones, and a scope without the key takes
// the fallback: the repository's axes for a package, both for the repository.
const axesOf = (input: {
  config: ProjectConfig;
  fallback: ReadonlySet<Axis>;
  log: WarningLog;
  scope: Scope;
}): void => {
  const { config, scope } = input;
  const isHere = (place: ConfigPlace): boolean => place.app === scope.app && place.key === AXES_KEY;
  const isListed = config.lists.some(isHere) && !config.empties.some(isHere);
  const picked = pickedAxesOf(input);

  scope.axes.add(Axis.Foundation);

  for (const axis of OPTIONAL_AXES) {
    if (isListed ? picked.has(axis) : input.fallback.has(axis)) {
      scope.axes.add(axis);
    }
  }
};

const addWithBases = (input: { id: string; model: ProjectModel; scope: Scope }): void => {
  input.scope.blocks.add(input.id);

  for (const base of basesOf(input)) {
    input.scope.blocks.add(base);
  }
};

const declare = (input: {
  entry: ConfigItem;
  log: WarningLog;
  model: ProjectModel;
  scope: Scope;
}): void => {
  const { entry, log, model } = input;
  const name = entry.text;
  const block = model.byId.get(name);

  if (name.includes('/')) {
    log.add({
      code: WarningCode.Unknown,
      message: `${name} is a path — put the block in a pack listed under packs: and name it by its id`,
    });
  } else if (block === undefined) {
    log.add({
      code: WarningCode.Unknown,
      message: `${name} is not a block — check the name`,
    });
  } else if (block.layer === Layer.Core) {
    log.add({
      code: WarningCode.WrongKey,
      message: `core is always active — remove it from ${entry.key}`,
    });
  } else if (block.isAbstract) {
    log.add({
      code: WarningCode.Abstract,
      message: `${name} cannot be listed — list ${heirsOf({
        id: name,
        model,
      })}`,
    });
  } else {
    if (block.layer !== layerOfKey(entry.key)) {
      log.add({
        code: WarningCode.WrongKey,
        message: `${name} is ${ARTICLE[block.layer]} — move it from ${entry.key} to ${keyOfLayer(block.layer)}`,
      });
    }

    addWithBases({
      id: name,
      model,
      scope: input.scope,
    });
  }
};

const isDeclared = (input: { entry: ConfigItem; scope: Scope }): boolean =>
  input.entry.app === input.scope.app &&
  input.entry.key !== AXES_KEY &&
  input.entry.key !== PACKS_KEY;

// A scope starts from the blocks it inherits, in the catalogue's order; then each block it lists
// joins it.
const fillScope = (input: {
  config: ProjectConfig;
  inherited: ReadonlySet<string>;
  log: WarningLog;
  model: ProjectModel;
  scope: Scope;
}): void => {
  const { scope } = input;

  for (const block of input.model.blocks) {
    if (input.inherited.has(block.id)) {
      scope.blocks.add(block.id);
    }
  }

  for (const entry of input.config.items.filter((listed) =>
    isDeclared({
      entry: listed,
      scope,
    }),
  )) {
    declare({
      ...input,
      entry,
    });
  }
};

const scopeOf = (input: { app: string; index: number }): Scope => ({
  ...input,
  axes: new Set(),
  blocks: new Set(),
});

// The repository's scope, which holds core when the release has it, then each package's, which
// inherits the repository's axes and blocks.
const scopesOf = (input: {
  config: ProjectConfig;
  log: WarningLog;
  model: ProjectModel;
}): Scopes => {
  const { config, log, model } = input;
  const repository = scopeOf({
    app: '',
    index: 0,
  });
  const packages = config.apps.map((app, at) =>
    scopeOf({
      app,
      index: at + 1,
    }),
  );

  axesOf({
    config,
    fallback: new Set(OPTIONAL_AXES),
    log,
    scope: repository,
  });

  for (const scope of packages) {
    axesOf({
      config,
      fallback: repository.axes,
      log,
      scope,
    });
  }

  fillScope({
    config,
    inherited: new Set([
      CORE,
    ]),
    log,
    model,
    scope: repository,
  });

  for (const scope of packages) {
    fillScope({
      config,
      inherited: repository.blocks,
      log,
      model,
      scope,
    });
  }

  return [
    repository,
    ...packages,
  ];
};

export { checkKeys, scopesOf };
