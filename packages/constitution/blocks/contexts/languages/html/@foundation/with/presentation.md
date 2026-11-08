# Presentation

> Governs the markup of a screen: its viewport, images and their sources, native elements and the attributes that carry its accessibility.

## Screens

### image-declares-its-size → late-content-reserves-its-space · MUST

Every image declares its width and height in its markup.

#### Why

An image without its size has no box until it loads, so the content below it jumps when it arrives and the user loses their place or presses what slid under their finger.

#### Examples

```html title="Avoid"
<img
  src="/products/notebook-800.jpg"
  srcset="/products/notebook-400.jpg 400w, /products/notebook-800.jpg 800w"
  sizes="(min-width: 40rem) 20rem, 100vw"
  alt="Grey linen notebook"> <!-- no box until it loads -->
```

```html title="Prefer"
<img
  src="/products/notebook-800.jpg"
  srcset="/products/notebook-400.jpg 400w, /products/notebook-800.jpg 800w"
  sizes="(min-width: 40rem) 20rem, 100vw"
  width="800"
  height="600"
  alt="Grey linen notebook">
```

### image-offers-its-sources-by-srcset → image-sharp-at-the-pixel-density · SHOULD

Every raster image a document shows in its content offers its sources by `srcset`. It offers them by width with `sizes`, or by pixel density where the image is shown at one fixed size.

#### Why

An `<img src>` alone gives the browser one file for every screen, and only `srcset` lets it pick by density, and with `sizes` by box, before the layout is known.

#### Examples

```html title="Avoid"
<img
  src="/products/notebook-1600.jpg"
  width="800"
  height="600"
  alt="Grey linen notebook"> <!-- one file for every screen -->
```

```html title="Prefer"
<img
  src="/products/notebook-800.jpg"
  srcset="/products/notebook-400.jpg 400w, /products/notebook-800.jpg 800w, /products/notebook-1600.jpg 1600w"
  sizes="(min-width: 40rem) 20rem, 100vw"
  width="800"
  height="600"
  alt="Grey linen notebook">
```

### viewport-declared-responsive → wcag-aa-conformance · MUST

Every document a browser opens as a page declares the responsive viewport, `<meta name="viewport" content="width=device-width, initial-scale=1">`.

#### Why

Without it a phone lays the page out at a desktop's width and shrinks it, so its text is too small to read and its lines run past the screen — WCAG 2.2, Reflow.

#### Examples

```html title="Avoid"
<head>
  <meta charset="utf-8">
  <title>Your cart</title>
</head> <!-- a phone lays it out at a desktop's width -->
```

```html title="Prefer"
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your cart</title>
</head>
```

### viewport-never-blocks-zoom → wcag-aa-conformance · MUST

No document's viewport blocks zooming: its `<meta name="viewport">` holds no `user-scalable=no` and no `maximum-scale` below 5.

#### Why

A page that cannot be zoomed fails the people who need its text larger — WCAG 2.2, Resize Text.

#### Examples

```html title="Avoid"
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

```html title="Prefer"
<meta name="viewport" content="width=device-width, initial-scale=1">
```

## Components

### pattern-carried-by-its-native-element → complex-pattern-built-on-accessible-primitives · MUST

Wherever no library of accessible component primitives is active, every dialog, popover and disclosure is carried by HTML's own element for it. A dialog is a `<dialog>`, a popover takes the `popover` attribute, and a disclosure or an accordion's section is a `<details>`.

#### Why

A dialog, a popover or a disclosure scripted by hand gets its focus, its keyboard or its announcement wrong, while each of these elements brings them from the browser.

#### Examples

```html title="Avoid"
<button type="button" aria-expanded="false" aria-controls="return-policy">
  Return policy
</button>
<div id="return-policy" hidden>
  <p>Unused items can be returned within 30 days.</p>
</div>
<script type="module" src="/scripts/disclosure.js"></script> <!-- toggles it by hand -->
```

```html title="Prefer"
<details>
  <summary>Return policy</summary>
  <p>Unused items can be returned within 30 days.</p>
</details>
```

## Forms

### field-declares-its-autocomplete → own-data-field-declares-its-purpose · MUST

Every field of its user's own data declares its purpose by the `autocomplete` token HTML defines for it.

#### Why

A field without its token leaves its user to type by hand what the browser already knows, and assistive technology cannot tell them what the field is for — WCAG 2.2, Identify Input Purpose.

#### Examples

```html title="Avoid"
<label for="delivery-street">Street address</label>
<input id="delivery-street" name="street">

<label for="delivery-postal-code">Postal code</label>
<input id="delivery-postal-code" name="postal-code"> <!-- typed by hand every time -->
```

```html title="Prefer"
<label for="delivery-street">Street address</label>
<input id="delivery-street" name="street" autocomplete="shipping street-address">

<label for="delivery-postal-code">Postal code</label>
<input id="delivery-postal-code" name="postal-code" autocomplete="shipping postal-code">
```

### busy-submit-never-disabled → submit-busy-keeps-its-focus · MUST

Every busy submit button stays focusable, never `disabled`; it is marked busy by `aria-disabled`.

#### Why

A `disabled` button drops its focus to the page and leaves the order of the keyboard, while one marked by `aria-disabled` keeps its place in that order and is announced as unavailable.

#### Examples

```html title="Avoid"
<button type="submit" disabled>Placing order…</button> <!-- focus drops to the page -->
```

```html title="Prefer"
<button type="submit" aria-disabled="true">Placing order…</button>
```

## Accessibility

### tabindex-only-zero-or-minus-one → focus-order-follows-the-visual-order · MUST

Every element's `tabindex` is `0` or `-1`, never a positive number.

#### Why

A positive `tabindex` moves its element ahead of every other in the order of the keyboard, wherever it sits on the screen, and a keyboard user loses their place — WCAG 2.2, Focus Order.

#### Examples

```html title="Avoid"
<form action="/checkout" method="post">
  <label for="delivery-email">Email</label>
  <input id="delivery-email" name="email" type="email" autocomplete="email">
  <label for="coupon-code">Coupon</label>
  <input id="coupon-code" name="coupon" tabindex="1"> <!-- reached before the email above it -->
  <button type="submit">Place order</button>
</form>
```

```html title="Prefer"
<form action="/checkout" method="post">
  <label for="delivery-email">Email</label>
  <input id="delivery-email" name="email" type="email" autocomplete="email">
  <label for="coupon-code">Coupon</label>
  <input id="coupon-code" name="coupon">
  <button type="submit">Place order</button>
</form>
```

### focusable-element-never-aria-hidden → wcag-aa-conformance · MUST

No element that can take focus, or holds one that can, is `aria-hidden`. Exempt: content behind an open modal layer, while focus stays in that layer.

#### Why

A screen reader user then reaches a control their reader cannot name or describe, and hears nothing where the focus is — WCAG 2.2, Name, Role, Value.

#### Examples

```html title="Avoid"
<li aria-hidden="true"> <!-- its link still takes focus -->
  <a href="/products/notebook">Grey linen notebook</a>
</li>
```

```html title="Prefer"
<li inert>
  <a href="/products/notebook">Grey linen notebook</a>
</li>
```

### html-element-taken-for-each-structure → native-semantics-first · MUST

Every action, move, list and table takes HTML's own element for it. Such an element is the one HTML gives that structure, such as a `<button>` for an action, an `<a>` with a real `href` for a move, a `<ul>`, an `<ol>` or a `<dl>` for a list and a `<table>` for a table.

#### Why

A generic element with a role added announces what it does not keep (no keyboard, no focus, no behaviour), while a native element brings all three — the first rule of ARIA use.

#### Examples

```html title="Avoid"
<div role="button" tabindex="0">Add to cart</div> <!-- no Enter, no Space -->
<span role="link" data-href="/cart">View cart</span>
```

```html title="Prefer"
<button type="button">Add to cart</button>
<a href="/cart">View cart</a>
```

### table-header-cells-marked-by-th → wcag-aa-conformance · MUST

Every header cell of a table is a `<th>`.

#### Why

A screen reader names each cell by the header cells of its row and its column, so in a table whose headers are plain cells its user hears a grid of unnamed values — WCAG 2.2, Info and Relationships.

#### Examples

```html title="Avoid"
<table>
  <caption>Order 1042</caption>
  <tr>
    <td><strong>Item</strong></td> <!-- looks like a header, read as a cell -->
    <td><strong>Quantity</strong></td>
  </tr>
  <tr>
    <td>Notebook</td>
    <td>2</td>
  </tr>
</table>
```

```html title="Prefer"
<table>
  <caption>Order 1042</caption>
  <thead>
    <tr>
      <th scope="col">Item</th>
      <th scope="col">Quantity</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Notebook</td>
      <td>2</td>
    </tr>
  </tbody>
</table>
```

### table-has-an-accessible-name · MUST

Every table has an accessible name, such as its `<caption>` or `aria-labelledby` pointing at the heading that titles it.

#### Why

A screen reader announces a table by its name, so its user learns what a table without one holds only by reading its cells.

#### Examples

```html title="Avoid"
<h2>Unpaid invoices</h2>
<table> <!-- announced as just "table" -->
  <thead>
    <tr>
      <th scope="col">Invoice</th>
      <th scope="col">Due</th>
    </tr>
  </thead>
</table>
```

```html title="Prefer"
<h2 id="unpaid-invoices-title">Unpaid invoices</h2>
<table aria-labelledby="unpaid-invoices-title">
  <thead>
    <tr>
      <th scope="col">Invoice</th>
      <th scope="col">Due</th>
    </tr>
  </thead>
</table>
```

### page-marks-its-landmarks → wcag-aa-conformance · MUST

Every page marks its landmarks by their elements, with one `<main>`. Its landmarks are its header, navigation, main content and footer, where it has them.

#### Why

People using a screen reader or a keyboard move through a page by its landmarks, and a page without them must be read from the top — WCAG 2.2, Info and Relationships and Bypass Blocks.

#### Examples

```html title="Avoid"
<body>
  <a href="#content">Skip to content</a>
  <div> <!-- no landmark to move by -->
    <a href="/">Shop</a>
    <ul>
      <li><a href="/orders">Orders</a></li>
      <li><a href="/invoices">Invoices</a></li>
    </ul>
  </div>
  <div id="content">
    <h1>Orders</h1>
  </div>
</body>
```

```html title="Prefer"
<body>
  <a href="#content">Skip to content</a>
  <header>
    <a href="/">Shop</a>
    <nav aria-label="Account">
      <ul>
        <li><a href="/orders">Orders</a></li>
        <li><a href="/invoices">Invoices</a></li>
      </ul>
    </nav>
  </header>
  <main id="content">
    <h1>Orders</h1>
  </main>
</body>
```

### skip-link-comes-first → wcag-aa-conformance · MUST

Wherever a page repeats blocks before its content, its first focusable element is a link that skips them. Such blocks include a header and a navigation, and the link leads to the main content.

#### Why

Without it, a keyboard user tabs through the same header and navigation on every page before reaching its content — WCAG 2.2, Bypass Blocks.

#### Examples

```html title="Avoid"
<body>
  <header> <!-- tabbed through on every page -->
    <nav aria-label="Account">
      <ul>
        <li><a href="/orders">Orders</a></li>
        <li><a href="/invoices">Invoices</a></li>
      </ul>
    </nav>
  </header>
  <main id="content">
    <h1>Orders</h1>
  </main>
</body>
```

```html title="Prefer"
<body>
  <a href="#content">Skip to content</a>
  <header>
    <nav aria-label="Account">
      <ul>
        <li><a href="/orders">Orders</a></li>
        <li><a href="/invoices">Invoices</a></li>
      </ul>
    </nav>
  </header>
  <main id="content">
    <h1>Orders</h1>
  </main>
</body>
```

### live-region-polite-unless-urgent → announcement-interrupts-only-when-urgent · MUST

Every live region that carries no urgent announcement is polite, never assertive.

#### Why

An assertive announcement cuts off what its listener is hearing, so a status sent to one interrupts them for what could have waited — WCAG 2.2, Status Messages.

#### Examples

```html title="Avoid"
<p aria-live="assertive">Notebook added to your cart.</p> <!-- cuts off what is being read -->
```

```html title="Prefer"
<p role="status">Notebook added to your cart.</p>
```

### invalid-field-tied-to-its-message → invalid-field-tells-its-error · MUST

Every invalid field carries `aria-invalid` and an `aria-describedby` that points at its message.

#### Why

A field marked wrong only by its look, its message merely placed nearby, is announced as valid, and its user never hears why it is wrong — WCAG 2.2, Error Identification.

#### Examples

```html title="Avoid"
<label for="postal-code">Postal code</label>
<input id="postal-code" autocomplete="shipping postal-code"> <!-- announced as valid -->
<p>Enter a postal code of five digits.</p>
```

```html title="Prefer"
<label for="postal-code">Postal code</label>
<input
  id="postal-code"
  autocomplete="shipping postal-code"
  aria-invalid="true"
  aria-describedby="postal-code-error">
<p id="postal-code-error">Enter a postal code of five digits.</p>
```
