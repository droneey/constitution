# Suppressions

> Governs the lint's suppressions and the file form of its GritQL rules.

## Vocabulary

A GritQL rule is a file ending in **`.grit`**{#grit-rule}.

## General

### biome-suppression-names-one-rule → suppression-silences-one-finding · MUST

Every Biome suppression names one rule on one line. It is `// biome-ignore lint/<group>/<rule>`, never a group alone, `biome-ignore-all` or `biome-ignore-start`.

#### Why

Biome also takes a group, a whole file and a range, which silence findings nobody meant to; only this form names one rule on one line.

#### Examples

```ts title="Avoid"
// biome-ignore lint: the body is one table the function returns
export const statusLabels = (): Readonly<Record<OrderStatus, string>> => ({
  [OrderStatus.Placed]: 'Placed',
  [OrderStatus.Shipped]: 'Shipped',
  // …one row for each of the statuses
});
```

```ts title="Prefer"
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: the body is one table the function returns
export const statusLabels = (): Readonly<Record<OrderStatus, string>> => ({
  [OrderStatus.Placed]: 'Placed',
  [OrderStatus.Shipped]: 'Shipped',
  // …one row for each of the statuses
});
```

### biome-suppression-gives-its-reason-after-the-colon → suppression-states-its-reason · MUST

Every Biome suppression states its reason after its colon.

#### Why

A reason after the colon stands on the suppression's own line, where a reviewer judges the exception, while one in a comment of its own is left behind when the suppression moves or goes.

#### Examples

```ts title="Avoid"
// The body is one table the function returns.
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: <explanation>
export const statusLabels = (): Readonly<Record<OrderStatus, string>> => ({
  [OrderStatus.Placed]: 'Placed',
  // …one row for each of the statuses
});
```

```ts title="Prefer"
// biome-ignore lint/complexity/noExcessiveLinesPerFunction: the body is one table the function returns
export const statusLabels = (): Readonly<Record<OrderStatus, string>> => ({
  [OrderStatus.Placed]: 'Placed',
  // …one row for each of the statuses
});
```
