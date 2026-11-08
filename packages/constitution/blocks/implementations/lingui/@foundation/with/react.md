# React

> Governs messages in React components.

## General

### components-take-t-from-use-lingui · MUST

Every component renders its descriptors through the `i18n` or the `t` that `useLingui` returns, never the global one.

#### Why

A global `t` does not re-render the component when the locale changes, so the component shows the old locale's text until something else renders it.

#### Examples

```tsx title="Avoid"
import { i18n } from '@lingui/core';

export const EmptyCart = (): ReactElement => <p>{i18n._(messages.emptyCart)}</p>;
```

```tsx title="Prefer"
import { useLingui } from '@lingui/react';

export const EmptyCart = (): ReactElement => {
  const { i18n } = useLingui();

  return <p>{i18n._(messages.emptyCart)}</p>;
};
```
