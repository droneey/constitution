# Document

> Governs who inserts a third-party script into the document.

## General

### third-party-script-rendered-by-its-component → third-party-script-declared-where-it-is-used · MUST

Every third-party script a component uses is rendered by that component as `<script async src>`.

#### Why

A script declared elsewhere loads where nothing needs it, or before what it needs, while React dedupes and orders the scripts it renders, which load with the component that needs them.

#### Examples

```html title="Avoid"
<!-- index.html -->
<head>
  <script async src="https://js.stripe.com/v3/"></script>
</head>
```

```tsx title="Prefer"
export const CardPayment = ({ clientSecret }: CardPaymentProps): ReactElement => (
  <>
    <script async src="https://js.stripe.com/v3/" />
    <CardForm clientSecret={clientSecret} />
  </>
);
```
