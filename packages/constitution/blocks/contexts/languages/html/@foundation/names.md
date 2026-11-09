# Names

> Governs a name in a document: the id of an element.

## General

### id-unique-in-its-document · MUST

Every `id` appears once in its document.

#### Why

`for`, `aria-labelledby`, `aria-describedby` and a fragment link resolve to the first element with the id, so a second one is never labelled, described or reached.

#### Examples

```html title="Avoid"
<li>
  <label for="quantity">Notebook</label>
  <input id="quantity" type="number" min="1" value="2">
</li>
<li>
  <label for="quantity">Pencil case</label> <!-- labels the notebook's field -->
  <input id="quantity" type="number" min="1" value="1">
</li>
```

```html title="Prefer"
<li>
  <label for="quantity-notebook">Notebook</label>
  <input id="quantity-notebook" type="number" min="1" value="2">
</li>
<li>
  <label for="quantity-pencil-case">Pencil case</label>
  <input id="quantity-pencil-case" type="number" min="1" value="1">
</li>
```
