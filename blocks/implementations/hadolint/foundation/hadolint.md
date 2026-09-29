# hadolint

## hadolint-over-every-dockerfile → docker-files-linted-in-the-check
The check runs hadolint, with the archive's `presets/hadolint/foundation/docker.yaml` as `--config`, over every Dockerfile it finds by name, never over a list kept by hand.

| Why | Check | Tags |
|---|---|---|
| hadolint takes files, not folders; a list kept by hand misses the next Dockerfile. | tool — lint | [] |

## hadolint-suppression-names-rule-and-reason → suppression-states-its-reason
A suppression is `# hadolint ignore=<code>` on the line above its instruction, with the reason beside it; never a rule ignored for the whole file or in the configuration.

| Why | Check | Tags |
|---|---|---|
| a suppression at its line can be judged there; one in the configuration silences the rule for every Dockerfile. | review | [] |
