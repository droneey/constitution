# Types

> Governs a value in a document and its type: how a boolean attribute is written.

## Attributes

### boolean-attribute-written-by-presence · MUST

Every boolean attribute is present where it is true and absent where it is false. It is never present with a value meant as false, such as `disabled="false"`.

#### Why

The browser reads any value of a boolean attribute, `"false"` included, as true, so `disabled="false"` disables.

#### Examples

```html title="Avoid"
<label>
  <input type="checkbox" name="gift-wrap" checked="false"> <!-- checked -->
  Gift wrap
</label>
```

```html title="Prefer"
<label>
  <input type="checkbox" name="gift-wrap">
  Gift wrap
</label>
<label>
  <input type="checkbox" name="email-invoice" checked>
  Email me the invoice
</label>
```
