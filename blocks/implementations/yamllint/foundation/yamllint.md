# yamllint

## yamllint-strict-over-every-file · MUST
The check runs `yamllint --strict .` over every YAML file; the configuration is `.yamllint.yaml`, extending devkit's template.
**Why:** a warning that passes is a rule nobody holds, and every YAML file of the repository is read the same way.
**Check:** review
**Tags:** process
**Implements:** `rules-held-by-tools`
