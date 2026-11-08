# Localization

> Governs the locale TypeScript's formatting and sorting calls take.

## Formats

### locale-passed-to-every-intl-call → values-formatted-by-the-active-locale · MUST

Every call that formats text for a person is given the active locale, never `undefined` in its place. These calls are every `toLocaleString`, `toLocaleDateString` and `toLocaleTimeString` call and every `Intl` formatter.

#### Why

Without a locale these calls take the runtime's own, the server's or the device's, so a value is shown in a locale the user never chose.

#### Examples

```ts title="Avoid"
export const formatPrice = (price: Money): string =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: price.currency }).format(
    Money.toDecimal(price),
  );
```

```ts title="Prefer"
export const formatPrice = (price: Money, locale: string): string =>
  new Intl.NumberFormat(locale, { style: 'currency', currency: price.currency }).format(
    Money.toDecimal(price),
  );
```

### text-sorted-by-a-collator-of-the-active-locale → text-sorted-by-the-locale · SHOULD

Every list of text a person reads is sorted by a collator of the active locale. It is sorted by `Intl.Collator` or `localeCompare` given that locale, never by the default sort, which orders by code unit.

#### Why

The default sort puts `Z` before `a` and every accented letter after `z`, and a collator without a locale takes the runtime's.

#### Examples

```ts title="Avoid"
export const sortCategoryNames = (names: readonly string[]): string[] => names.toSorted();
```

```ts title="Prefer"
export const sortCategoryNames = (names: readonly string[], locale: string): string[] =>
  names.toSorted(new Intl.Collator(locale).compare);
```
