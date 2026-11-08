# Bundle

> Governs what a page loads: the bundle's size, the format of its images, the caching of its files and a tab that outlives its release.

## Vocabulary

A **release reload** is a full load of the current release at the tab's next navigation, or after its user accepts a reload, which keeps what they typed.

## Size

### bundle-within-its-size-budget · SHOULD

Each bundle the tab loads stays within the size budget the project sets for its entry. Each entry has a budget of its own, never one shared by the whole output.

#### Why

Size grows one dependency at a time, and only a budget notices the change that crosses the line before people on slow networks and devices do, while a budget for the whole output lets one entry grow at another's expense.

#### Examples

```json title="Avoid"
[
  { "name": "everything", "path": "dist/**/*.js", "limit": "900 kB" }
]
```

```json title="Prefer"
[
  { "name": "storefront", "path": "dist/assets/storefront-*.js", "limit": "180 kB" },
  { "name": "checkout", "path": "dist/assets/checkout-*.js", "limit": "120 kB" }
]
```

### content-image-in-a-modern-format · SHOULD

Every raster image a page shows in its content is served as AVIF or WebP.

#### Why

A JPEG or a PNG carries the same picture in more bytes, which people on slow networks wait for, while every current browser decodes AVIF and WebP.

#### Examples

```html title="Avoid"
<img src="/images/espresso-machine.jpg" alt="Espresso machine, brushed steel" width="640" height="480" />
```

```html title="Prefer"
<picture>
  <source srcset="/images/espresso-machine.avif" type="image/avif" />
  <img src="/images/espresso-machine.webp" alt="Espresso machine, brushed steel" width="640" height="480" />
</picture>
```

## Caching

### hashed-file-cached-as-immutable · SHOULD

Every file named by the hash of its content is cached for good, served as `immutable`.

#### Why

A hashed file never changes, so a browser that asks for it again spends a request on what it already holds.

#### Examples

```text title="Avoid"
GET /assets/checkout-4f9c2a1b.js
Cache-Control: no-cache
```

```text title="Prefer"
GET /assets/checkout-4f9c2a1b.js
Cache-Control: public, max-age=31536000, immutable
```

### fixed-name-file-revalidated-on-every-use · MUST

Every fixed-name file that names other files of its release, holds its settings or holds its code is revalidated on every use. A fixed-name file is one served under a name that stays the same when its content changes, such as the document, the served settings and the service worker's script.

#### Why

Such a file names the hashed files of its release, holds its settings or holds its code, so a stale copy makes the tab load a release that no longer exists, settings that no longer hold or code the release replaced.

#### Examples

```text title="Avoid"
GET /index.html
Cache-Control: max-age=86400

GET /settings.json
Cache-Control: max-age=86400
```

```text title="Prefer"
GET /index.html
Cache-Control: no-cache

GET /settings.json
Cache-Control: no-cache
```

## Releases

### tab-missing-a-lazy-file-loads-the-current-release · MUST

Every tab whose lazily loaded file is gone after a release loads the current release. It does so by a full load of the navigation that failed, or by a release reload where the file was loaded without a navigation.

#### Why

A tab stays open for days across releases, and its next lazy import asks for a hashed file the new release no longer serves, so the screen it opens fails to load.

#### Examples

```tsx title="Avoid"
// src/main.tsx
createRoot(rootElement).render(<App />); // a gone lazy file leaves the screen broken
```

```tsx title="Prefer"
// src/main.tsx
// Why: every lazy file of the program loads on a navigation, which the reload repeats
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  location.reload();
});

createRoot(rootElement).render(<App />);
```
