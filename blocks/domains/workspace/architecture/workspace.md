# Workspace

## The tree

```
packages/<name>/       the product's units: its applications and the packages it distributes
packages/<product>/    a product of several units, grouped
shared/<name>/         what two or more units of the product need: code in one language, or data in no language
libs/<name>/           what knows nothing of the product
```

## workspace-units-placed-by-reach · SHOULD
A workspace holds its units in three folders at its root: `packages/<name>/`, the product's units — its applications and the packages it distributes; `shared/<name>/`, what two or more of them need; and `libs/<name>/`, what knows nothing of the product. A product made of several units may group them under `packages/<product>/`.

| Why | Check | Tags |
|---|---|---|
| a unit's folder says who may use it before it is opened, and the direction of the imports follows from the folders. | review | [] |

## root-holds-only-the-workspace · SHOULD
The root of a workspace holds only the workspace and the scripts of the check.

| Why | Check | Tags |
|---|---|---|
| a root with no code of its own has nothing a unit could import by accident, and nothing that leaks into a consumer. | review | [] |

## shared-unit-on-the-second-consumer → code-lives-with-its-reason-to-change
What two or more units of the product need lives in a unit of `shared/`, created when the second one needs it. Each such unit has one purpose: code in one language, or data in no language.

| Why | Check | Tags |
|---|---|---|
| kept with its one user, a piece changes with it; moved when a second one needs it, it is written once, and a unit of one purpose is taken only by those that need it. | review | [] |

## Direction

## product-units-blind-to-each-other → features-blind-to-each-other
A unit of `packages/` never imports another. Inside a group `packages/<product>/` the same holds at the group's level: what two members need is a member of its own, and the members that use it never import each other.

| Why | Check | Tags |
|---|---|---|
| a unit that knows another cannot be released, changed or removed alone. | tool/imports | [] |

## units-import-toward-libs → dependencies-point-inward
Imports between units point from `packages/` to `shared/` to `libs/`: a unit of `shared/` imports no unit of `packages/`, and a unit of `libs/` none of `packages/` or `shared/`.

| Why | Check | Tags |
|---|---|---|
| the more units need a piece, the more stable it must be; an import upward makes it change whenever one of its users does. | tool/imports | [] |
