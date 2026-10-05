# hadolint

## hadolint-over-every-dockerfile → docker-files-linted-in-the-check
The check runs hadolint, with the archive's `presets/common/hadolint/foundation/docker.yaml` as `--config`, over every Dockerfile it finds by name, never over a list kept by hand.

| Why | Check | Tags |
|---|---|---|
| hadolint takes files, not folders; a list kept by hand misses the next Dockerfile. | tool/lint | [] |

## hadolint-suppression-names-rule-and-reason → suppression-silences-one-finding
A suppression is `# hadolint ignore=<code>` on the line above its instruction, with the reason beside it; never a rule ignored in the configuration.

| Why | Check | Tags |
|---|---|---|
| a rule ignored in the configuration is silenced for every Dockerfile. | review | [] |
