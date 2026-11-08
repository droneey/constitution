# Packages

> Governs how a package of the repository is named and what its manifest marks.

## Names

### unit-named-after-its-folder · SHOULD

Every package of the repository is named after its folder. A package in a group folder takes the group's name and its own folder's, `<group>-<folder>`.

#### Why

A package named apart from its folder sends the reader of every import to look up where it lives, and the same folder in two groups would give two packages one name.

#### Examples

```text title="Avoid"
packages/invoices/typescript/   name: invoice-tools
packages/money/                 name: currency
```

```text title="Prefer"
packages/invoices/typescript/   name: invoices-typescript
packages/money/                 name: money
```

### package-name-under-the-repositorys-namespace · SHOULD

Every package of the repository is named under the repository's own namespace in its registry. In a registry that has no namespaces, its name opens with a prefix the registry reserves for the repository.

#### Why

A package named outside the repository's namespace or prefix can collide with another owner's package of the same name, and a consumer cannot tell from the name which packages come from the same repository.

#### Examples

```text title="Avoid"
packages/money/      name: money
packages/invoices/   name: invoices
```

```text title="Prefer"
packages/money/      name: @shop/money
packages/invoices/   name: @shop/invoices
```

## Marks

### package-nobody-installs-marked-unpublishable · MUST

Wherever a package's registry offers a mark that refuses publication, every package nobody outside the repository installs carries it in its manifest. The root's manifest is among them, wherever the root is a package.

#### Why

A consumer who installed the root would get the repository's tooling instead of a package, and a publish run over the whole repository would release by mistake a package nobody outside installs, with whatever it holds.

#### Examples

```text title="Avoid"
root manifest           name: shop
apps/shop-api manifest  name: @shop/api
```

```text title="Prefer"
root manifest           name: shop       publishable: no
apps/shop-api manifest  name: @shop/api  publishable: no
```
