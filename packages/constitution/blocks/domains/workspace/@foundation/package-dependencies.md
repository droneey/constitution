# Package dependencies

> Governs the dependencies of packages and the imports between them.

## Dependencies

### dependency-has-one-version-across-units · MUST

Every dependency has one version across the repository. Every manifest names it by that version or by one range shared across the manifests, which the lockfile resolves once. Exempt: the range a package others install declares for a dependency whose version its consumer chooses, such as the tool it configures or the host framework it plugs into.

#### Why

Two versions of one dependency behave differently in two packages, and the difference is found in production.

#### Examples

```text title="Avoid"
apps/shop-web/manifest    date-library: 3.6.0
apps/shop-api/manifest    date-library: 4.1.0
```

```text title="Prefer"
apps/shop-web/manifest    date-library: 4.1.0
apps/shop-api/manifest    date-library: 4.1.0
```

### own-package-resolved-from-the-working-tree · SHOULD

Every package of the repository that another of its packages depends on is resolved from the working tree, never from the registry.

#### Why

A package resolved from the registry gives the packages that use it its last published version, so a change to it reaches them only after it is published, untested by them.

#### Examples

```text title="Avoid"
apps/shop-api/manifest
  @shop/money: 1.4.0          fetched from the registry
```

```text title="Prefer"
apps/shop-api/manifest
  @shop/money: workspace
```

## Imports

### unit-reached-only-through-its-published-entries → dependency-reached-through-its-published-entries · MUST

Every package of the repository is reached only by its name, through its published entries. Another package and a command the root's manifest declares alike reach it so, never by a path into its folder.

#### Why

A path inside a package is not part of its contract, and an import by path proves an entry no consumer can reach.

#### Examples

```pseudo title="Avoid"
# apps/shop-api/src/orders/order
import formatMoney from "../../../../packages/money/src/format/format-money"
```

```pseudo title="Prefer"
# apps/shop-api/src/orders/order
import formatMoney from "@shop/money/format"
```

### units-form-no-dependency-cycle → module-imports-form-no-cycle · MUST

The packages of a repository form no cycle, neither in the dependencies their manifests declare nor in their imports.

#### Why

Packages in a cycle cannot be built, released or versioned apart, so they are one package in disguise — the acyclic dependencies principle.

#### Examples

```mermaid title="Avoid"
flowchart LR
  invoices["@shop/invoices"] --> money["@shop/money"]
  money --> invoices
```

```mermaid title="Prefer"
flowchart LR
  invoices["@shop/invoices"] --> money["@shop/money"]
```

### apps-blind-to-each-other · MUST

No package of `apps/` imports another package of `apps/`.

#### Why

A package that knows another cannot be released, changed or removed alone; what two of them need goes to `packages/`.

#### Examples

```pseudo title="Avoid"
# apps/shop-web/src/cart/cart-total
import priceCart from "@shop/api/pricing"
```

```pseudo title="Prefer"
# apps/shop-web/src/cart/cart-total
import priceCart from "@shop/pricing"

# apps/shop-api/src/orders/order
import priceCart from "@shop/pricing"
```

### packages-never-import-apps → dependency-points-toward-stability · MUST

No package of `packages/` imports a package of `apps/`.

#### Why

The more packages need a piece, the more stable it must be, and an import of an app makes it change whenever that app does — the stable dependencies principle.

#### Examples

```pseudo title="Avoid"
# packages/invoices/src/invoice
import OrderTotal from "@shop/api/orders"
```

```pseudo title="Prefer"
# packages/invoices/src/invoice
import Money from "@shop/money"
```
