# CSS

> Governs the classes markup names.

## Classes

### class-used-is-declared · MUST

Every class markup names is declared by a stylesheet of the program or of its styling library. Exempt: a class that by design styles nothing, such as one a script or a spec selects elements by, or the language class a code highlighter reads.

#### Why

A class nothing declares is a typo or a leftover that styles nothing, while it reads as if it did.

#### Examples

```html title="Avoid"
<article class="order-card">
  <h2 class="order-card-title">Order 1042</h2>
  <p class="order-card-totl">42.00 EUR</p> <!-- no stylesheet declares it -->
</article>
```

```html title="Prefer"
<article class="order-card">
  <h2 class="order-card-title">Order 1042</h2>
  <p class="order-card-total">42.00 EUR</p>
</article>
```
