# Workspace

## The tree

```
packages/<name>/   the product's units: its applications and the packages it distributes
shared/            one unit with what two or more of them need, laid out by meaning
libs/<name>/       what knows nothing of the product
```

## workspace-units-placed-by-reach · SHOULD
A workspace holds its units in three places at its root: `packages/<name>/`, the product's units — its applications and the packages it distributes; `shared/`, one unit with what two or more of them need; and `libs/<name>/`, what knows nothing of the product. What a unit holds inside its folder, members with manifests of their own included, is its own structure.

| Why | Check | Tags |
|---|---|---|
| a unit's folder says who may use it before it is opened, and the direction of the imports follows from the folders. | review | [] |

## unit-named-after-its-folder · SHOULD
A unit's package name follows its folder, under the repository's scope: `packages/<name>/` is named `<name>`, `shared/` is named `shared`, and `libs/<name>/` is named `libs-<name>`. Another unit reaches a part of `shared/` through an entry named after the part.

| Why | Check | Tags |
|---|---|---|
| an import then names the folder it reaches, so a reader sees which way it points; the direction itself is held by the folders an import resolves to, so a wrong name never hides a wrong direction. | review | [] |

## root-holds-only-the-workspace · SHOULD
The root of a workspace holds only the workspace and the scripts of the check.

| Why | Check | Tags |
|---|---|---|
| a root with no code of its own has nothing a unit could import by accident, and nothing that leaks into a consumer. | review | [] |

## shared-part-on-the-second-consumer → code-lives-with-its-reason-to-change
What two or more units of the product need lives in `shared/`, laid out by meaning as a program's `shared/` is — `contracts/`, `kinds/`, the protocol two of them speak — and a part of it appears when a second unit needs it. In a repository of one language `shared/` is a unit of that language; in one of several, it holds a member for each language, with a manifest of its own, and the data in no language beside them.

| Why | Check | Tags |
|---|---|---|
| kept with its one user, a piece changes with it; moved when a second one needs it, it is written once, in the one place every unit looks for what it shares. | review | [] |

## Direction

## product-units-blind-to-each-other → features-blind-to-each-other
A unit of `packages/` never imports another.

| Why | Check | Tags |
|---|---|---|
| a unit that knows another cannot be released, changed or removed alone. | tool/imports | [] |

## units-import-toward-libs → dependencies-point-inward
Imports between units point from `packages/` to `shared/` to `libs/`: `shared/` imports no unit of `packages/`, and a unit of `libs/` none of `packages/` and nothing of `shared/`.

| Why | Check | Tags |
|---|---|---|
| the more units need a piece, the more stable it must be; an import upward makes it change whenever one of its users does. | tool/imports | [] |
