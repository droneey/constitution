# yamllint

## yamllint-strict-over-every-file → rules-held-by-tools
The check runs `yamllint --strict .` over every YAML file; the configuration is `.yamllint.yaml`, extending devkit's template.

| Why | Check | Tags |
|---|---|---|
| a warning that passes is a rule nobody holds, and every YAML file of the repository is read the same way. | review | [] |
