# React with remote data

> The states of remote data in a component.

## data-failures-rendered-as-state → data-result-is-union-by-status
A component renders the error state a data hook returns where the data would be, and never throws it.

| Why | Check | Tags |
|---|---|---|
| an expected failure is then shown where it belongs, and the boundary is left for what nobody expected. | review | [errors, ux] |
