# Messages

> Governs a message: its placeholders, its descriptor, its macros and its catalogue.

## General

### lingui-placeholder-named-by-its-variable → messages-take-named-parameters · MUST

Every value of a message becomes a named placeholder, never a positional one. It is interpolated in the macro's template by a variable's name, or labelled by `ph()`.

#### Why

Lingui turns any expression but a plain variable into a positional placeholder, which tells the translator nothing of the value it holds — ICU MessageFormat.

#### Examples

```ts title="Avoid"
// src/features/orders/presentation/components/order-summary.messages.ts
export const orderTotal = (order: OrderView) => msg`Total: ${formatMoney(order.total)}`;
```

```ts title="Prefer"
// src/features/orders/presentation/components/order-summary.messages.ts
export const orderTotal = (total: string) => msg`Total: ${total}`;
```

### shown-text-written-through-a-lingui-macro → user-facing-text-from-the-catalogue · MUST

Every shown text reaches the catalogue through a Lingui macro, never a bare literal or an id built by hand.

#### Why

Extraction finds a message only in a macro, so a bare literal never reaches the catalogue, and an id built by hand matches no message it extracts.

#### Examples

```tsx title="Avoid"
export const EmptyCart = (): ReactElement => {
  const { i18n } = useLingui();

  return <p>{i18n._('cart.empty')}</p>;
};
```

```tsx title="Prefer"
// src/features/cart/presentation/components/empty-cart.messages.ts
export const emptyCart = msg`Your cart is empty`;

// src/features/cart/presentation/components/empty-cart.tsx
import * as messages from './empty-cart.messages';

export const EmptyCart = (): ReactElement => {
  const { i18n } = useLingui();

  return <p>{i18n._(messages.emptyCart)}</p>;
};
```

### shown-text-rendered-from-its-descriptor → text-a-person-reads-held-in-a-messages-file · SHOULD

Every shown text is rendered from the `msg` descriptor its `.messages` file holds. The code that shows it hands that descriptor to Lingui, never a `t` or a `<Trans>` with its text inline.

#### Why

A macro written inline puts the text outside its `.messages` file, inside the code that shows it, so rewording it means editing that code.

#### Examples

```tsx title="Avoid"
// src/features/cart/presentation/components/empty-cart.tsx
export const EmptyCart = (): ReactElement => {
  const { t } = useLingui();

  return <p>{t`Your cart is empty`}</p>;
};
```

```tsx title="Prefer"
// src/features/cart/presentation/components/empty-cart.tsx
import * as messages from './empty-cart.messages';

export const EmptyCart = (): ReactElement => {
  const { i18n } = useLingui();

  return <p>{i18n._(messages.emptyCart)}</p>;
};
```

### macros-expanded-by-the-lingui-transform · MUST

Every run that loads code with Lingui's macros, the build and the specs, expands them first with Lingui's own transform.

#### Why

A macro is no function at run time, so code that reaches a run unexpanded throws there, and a transform borrowed from another tool can stop expanding it without a warning.

#### Examples

```ts title="Avoid"
// vite.config.ts
export default defineConfig({
  plugins: [react({ babel: { plugins: ['macros'] } })],
});
```

```ts title="Prefer"
// vite.config.ts
export default defineConfig({
  plugins: [react({ babel: { plugins: ['@lingui/babel-plugin-lingui-macro'] } }), lingui()],
});
```

### lingui-apostrophe-before-a-placeholder-fails-the-check → catalogue-apostrophe-never-escapes-a-parameter · MUST

Every check fails on a catalogue message whose straight apostrophe directly precedes a placeholder's brace or a plural's `#`. That holds for every locale's catalogue, the source catalogue included.

#### Why

Lingui hands every message to `@messageformat/parser`, whose one mode reads a straight apostrophe before a brace as the start of quoted text, so `l'{city}` shows `{city}` in that locale alone; a doubled `''` or a typographic `’` keeps the parameter.

#### Examples

```json title="Avoid"
{
  "scripts": {
    "check:catalogue": "lingui extract --clean && lingui compile --strict"
  }
}
```

```json title="Prefer"
{
  "scripts": {
    "check:catalogue": "lingui extract --clean && lingui compile --strict",
    "check:catalogue-apostrophes": "! grep -nE \"'[{#]\" src/locales/*/messages.po"
  }
}
```

### source-catalogue-current-in-the-check → source-catalogue-ships-with-its-code · MUST

Every check extracts the source locale's catalogue and fails when it differs from the one committed.

#### Why

A message missing from the committed catalogue reaches a user's screen untranslated.

#### Examples

```json title="Avoid"
{
  "scripts": {
    "check:catalogue": "lingui compile --strict"
  }
}
```

```json title="Prefer"
{
  "scripts": {
    "check:catalogue": "lingui extract --clean && git diff --exit-code -- src/locales/en/messages.po"
  }
}
```
