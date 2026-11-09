# Dependencies

> Governs scripts from other origins, the browsers the program supports and the capabilities beyond them.

## Vocabulary

The program's **support target** is the set of web-platform capabilities its supported browsers are declared by.

## Scripts

### cross-origin-script-loaded-with-integrity → download-checked-against-its-digest · MUST

Every script a page loads from another origin is checked by the browser against its digest before it runs. It is loaded with `integrity`, which holds the digest, and with `crossorigin`. Exempt: code its maker changes by design, such as a tag manager's or a payment provider's script, which the page loads only from the one origin it allows that code, through one loader that its CSP allows by its nonce.

#### Why

A script on another server changes when that server does, so whoever controls that server runs their code in the program's pages, unless the browser refuses a file whose hash is not the one pinned.

#### Examples

```html title="Avoid"
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
```

```html title="Prefer"
<script
  src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"
  integrity="sha384-9nhczxUqK87bcKHh20fSQcTGD4qq5GhayNYSYWqwBkINBhOfQLg/P5HG5lF1urn4"
  crossorigin="anonymous"
></script>
```

## Browsers

### supported-browsers-declared-by-a-support-target · SHOULD

The supported browsers are declared by a support target, never by a list of browser versions. The support target is one a public dataset keeps current, such as Baseline widely available or a Baseline year.

#### Why

A list of versions is kept current by hand, and once nobody does it the build and the checks go on serving browsers people left long ago while forbidding capabilities every browser in use has.

#### Examples

```json title="Avoid"
{
  "browserslist": ["chrome >= 109", "firefox >= 115", "safari >= 15.6"]
}
```

```json title="Prefer"
{
  "browserslist": ["baseline widely available"]
}
```

### capability-beyond-the-target-detected-first · MUST

Every capability of the web platform beyond the support target is used only behind a check that the browser has it. The check comes with a fallback, or with a polyfill the entry file loads.

#### Why

A browser the program supports but that lacks the capability would otherwise break the screen that uses it — progressive enhancement.

#### Examples

```ts title="Avoid"
export const showCheckoutStep = (render: () => void): void => {
  document.startViewTransition(render); // throws where the browser lacks it
};
```

```ts title="Prefer"
export const showCheckoutStep = (render: () => void): void => {
  if (!("startViewTransition" in document)) {
    render();
    return;
  }
  document.startViewTransition(render);
};
```
