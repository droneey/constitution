# Reader

> Governs the adapter that parses the config file and what a feature knows of the file.

## General

### config-file-parsed-by-its-adapter → outside-value-parsed-once-where-it-enters · MUST

Every config file is parsed in the adapter that reads it, which alone holds the config schema.

#### Why

A config schema held past the adapter ties code that never reads the file to that file's format and to the library it is parsed with, so a change of either reaches that code — ports and adapters.

#### Examples

```pseudo title="Avoid"
# features/deploy/application/use-cases/commands/deploy.use-case
function createDeploy({ files })
  return function(input, context)
    let raw = parseYaml(files.read(input.configPath, context))
    let config = deployConfigSchema.parse(raw)
    ...
```

```pseudo title="Prefer"
# features/deploy/infrastructure/config-file/deploy-config.adapter
function createDeployConfigAdapter({ files }): DeployConfigPort
  return {
    read: function(path, context)
      let raw = parseYaml(files.read(path, context))
      return toDeployPlan(deployConfigSchema.parse(raw))
  }

# features/deploy/application/use-cases/commands/deploy.use-case
function createDeploy({ deployConfig })
  return function(input, context)
    let plan = deployConfig.read(input.configPath, context)
    ...
```

### feature-blind-to-the-config-file → port-declared-by-the-layer-that-needs-it · SHOULD

Wherever several features take a section of the config file, only the composition module that splits the parsed file sees it whole. No feature reads the file, and every feature receives an input built from its own section, in its own words.

#### Why

A feature that reads the file depends on every other feature's section and on the file's format, so a change to any of them reaches it.

#### Examples

```pseudo title="Avoid"
# features/deploy/application/use-cases/commands/deploy.use-case
function createDeploy({ releaseConfig, servers })
  return function(input, context)
    let config = releaseConfig.read(input.configPath, context)

    for target in config.targets
      call servers.rollOut(target, context)
```

```pseudo title="Prefer"
# composition/release/application/use-cases/commands/release.use-case
import Deploy from "features/deploy"
import Notify from "features/notify"

function createRelease({ releaseConfig, deploy: Deploy, notify: Notify })
  return function(input, context)
    let config = releaseConfig.read(input.configPath, context)

    call deploy(toDeployInput(config.targets), context)
    call notify(toNotifyInput(config.notifications), context)
```
