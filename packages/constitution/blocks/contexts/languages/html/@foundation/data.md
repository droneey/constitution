# Data

> Governs the encoding a document declares.

## Encoding

### document-declares-utf-8-first → text-encoded-as-utf-8 · MUST

Every document declares `<meta charset="utf-8">` within its first 1024 bytes.

#### Why

The browser decides the encoding from the first 1024 bytes alone, so a declaration later than them, or none, leaves it to guess, and a wrong guess turns every character outside ASCII into other text.

#### Examples

```html title="Avoid"
<!doctype html>
<html lang="uk">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="/styles/entry.css">
    <title>Замовлення</title>
  </head> <!-- no charset: the browser guesses the encoding -->
```

```html title="Prefer"
<!doctype html>
<html lang="uk">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="/styles/entry.css">
    <title>Замовлення</title>
  </head>
```
