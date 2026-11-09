# Security

> Governs the input of interpreters, code run from strings, collections keyed by outside input, patterns matched against it and identifiers in it, and random values.

## Input from outside

### interpreter-input-never-joined-by-a-template-literal → outside-input-reaches-interpreters-as-parameters · MUST

No outside input reaches a query, markup or a log line through a template literal or `+`. It travels as the interpreter's parameter, such as a query's bound value or a structured log line's field, or in a tagged template whose tag the interpreter's library provides and which binds or escapes each value.

#### Why

A template literal joins the input into the text before the interpreter sees it, so the input becomes code, while a tag receives the strings and the values apart.

#### Examples

```ts title="Avoid"
const result = await pool.query(
  `select id, status from orders where customer_id = '${customerId}'`,
);
```

```ts title="Prefer"
const result = await pool.query({
  text: 'select id, status from orders where customer_id = $1',
  values: [customerId],
});
```

### code-never-run-from-a-string · MUST

No code is run from a string. There is no `eval`, no `new Function`, and no `setTimeout` or `setInterval` given a string.

#### Why

A string run as code runs whatever reaches it, so one piece of outside input inside it becomes the attacker's program, with every right the program has.

#### Examples

```ts title="Avoid"
export const appliesTo = (rule: DiscountRule, cart: Cart): boolean =>
  new Function('cart', `return ${rule.expression};`)(cart);
```

```ts title="Prefer"
export const appliesTo = (rule: DiscountRule, cart: Cart): boolean => {
  switch (rule.kind) {
    case DiscountRuleKind.MinimumTotal:
      return Money.compare(Cart.total(cart), rule.minimum) >= 0;
    case DiscountRuleKind.ContainsSku:
      return Cart.contains(cart, rule.sku);
  }
};
```

### outside-keyed-collection-is-a-map · MUST

Every collection keyed by values from outside the program is a `Map`, or an object made by `Object.create(null)`. No outside input is merged into a plain object by its own keys.

#### Why

A key such as `__proto__` or `constructor` written into a plain object changes the prototype every object shares, and with it the checks and defaults of the whole program.

#### Examples

```ts title="Avoid"
const linesBySku: Record<string, ImportedLine[]> = {};
for (const line of importedLines) {
  linesBySku[line.sku] = [...(linesBySku[line.sku] ?? []), line];
}
```

```ts title="Prefer"
const linesBySku = new Map<string, readonly ImportedLine[]>();
for (const line of importedLines) {
  linesBySku.set(line.sku, [...(linesBySku.get(line.sku) ?? []), line]);
}
```

### regexp-on-outside-input-holds-no-nested-quantifier → outside-input-matched-in-linear-time · MUST

No pattern that `RegExp` matches against outside input holds a nested or overlapping quantifier.

#### Why

`RegExp` backtracks in every runtime and is never the matcher that never backtracks core allows, so a nested or overlapping quantifier, whose safe forms a reader cannot tell at a glance from the ones that explode, can backtrack on a crafted input for minutes and hold the event loop, and every other request with it.

#### Examples

```ts title="Avoid"
const COUPON_CODE_PATTERN = /^([A-Z0-9]+-?)+$/;

const isCouponCode = (text: string): text is CouponCode => COUPON_CODE_PATTERN.test(text);
```

```ts title="Prefer"
const COUPON_CODE_PATTERN = /^[A-Z0-9][A-Z0-9-]{2,30}[A-Z0-9]$/;

const isCouponCode = (text: string): text is CouponCode => COUPON_CODE_PATTERN.test(text);
```

### outside-identifier-normalised-by-nfkc → outside-identifier-normalised-before-comparison · MUST

Where no standard fixes its form, every identifier in outside input that grants or refuses access is normalised as `value.normalize('NFKC').toLowerCase().normalize('NFKC')`.

#### Why

Two spellings of one identifier, another Unicode form or another case, otherwise pass a check made on one of them, lower-casing can undo the NFKC form made before it, and JavaScript has no full case fold, so its lower-casing is the fold — the Unicode Standard, section 3.13, and Unicode Standard Annexes #15 and #31.

#### Examples

```ts title="Avoid"
export const isAdmin = (username: string, admins: ReadonlySet<string>): boolean =>
  admins.has(username.toLowerCase());
```

```ts title="Prefer"
export const isAdmin = (username: string, admins: ReadonlySet<string>): boolean =>
  admins.has(username.normalize('NFKC').toLowerCase().normalize('NFKC'));
```

## Primitives

### guarding-random-value-from-web-crypto → guarding-token-from-a-cryptographic-random-source · MUST

Every token, nonce or identifier that guards access comes from Web Crypto's `crypto.getRandomValues` or `crypto.randomUUID`, never from `Math.random`.

#### Why

`Math.random` can be predicted from a few of its outputs, so a value drawn from it is guessed by whoever saw others; Web Crypto is a cryptographic source in every runtime.

#### Examples

```ts title="Avoid"
export const createResetToken = (): string => Math.random().toString(36).slice(2);
```

```ts title="Prefer"
export const createResetToken = (): string => crypto.randomUUID();
```
