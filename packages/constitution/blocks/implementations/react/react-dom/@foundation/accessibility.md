# Accessibility

> Governs ARIA, labels and ids in JSX.

## Controls

### labels-bound-by-html-for → every-control-has-an-accessible-name · MUST

Every label names its control with `htmlFor`.

#### Why

A label not bound to its control by `htmlFor` names it only while it wraps it, so a control moved out of its label reaches assistive technology without its name — WCAG 2.2, Name, Role, Value.

#### Examples

```tsx title="Avoid"
<>
  <label>{t`Coupon code`}</label>
  <input id={couponId} name="couponCode" />
</>
```

```tsx title="Prefer"
<>
  <label htmlFor={couponId}>{t`Coupon code`}</label>
  <input id={couponId} name="couponCode" />
</>
```

## ARIA and ids

### aria-attributes-written-hyphenated → wcag-aa-conformance · MUST

Every ARIA attribute in JSX is written hyphenated, as the DOM spells it, never in camelCase.

#### Why

A camelCase ARIA prop is no attribute the browser knows, so assistive technology never sees the state it was meant to carry — WAI-ARIA.

#### Examples

```tsx title="Avoid"
<button ariaExpanded={isOpen} ariaControls={menuId} onClick={toggle}>
  {t`Account`}
</button>
```

```tsx title="Prefer"
<button aria-expanded={isOpen} aria-controls={menuId} onClick={toggle}>
  {t`Account`}
</button>
```

### ids-from-use-id → id-unique-in-its-document · MUST

Every id comes from `useId`, never typed by hand or random. Exempt: the id of an element the root renders once and other code names, never a labelled control, such as a skip link's target or an SVG's shared `<defs>`, which is a constant under a suppression that says so.

#### Why

A typed id collides when the component renders twice, and a random one differs between server and client.

#### Examples

```tsx title="Avoid"
export const CouponField = (): ReactElement => (
  <>
    <label htmlFor="coupon-code">{t`Coupon code`}</label>
    <input id="coupon-code" name="couponCode" />
  </>
);
```

```tsx title="Prefer"
export const CouponField = (): ReactElement => {
  const couponId = useId();

  return (
    <>
      <label htmlFor={couponId}>{t`Coupon code`}</label>
      <input id={couponId} name="couponCode" />
    </>
  );
};
```
