# yaml

### yaml-only-at-the-edge → outside-value-untyped-until-parsed
The `yaml` package is imported only by the adapter or the `libs/` wrapper that parses.

| Why | Tags |
|---|---|
| a parser in the domain ties the business rules to a file format, and its untyped result must not travel inward. | [] |
