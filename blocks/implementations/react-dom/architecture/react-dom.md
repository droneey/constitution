# React DOM

## document-metadata-rendered-by-its-owner · SHOULD
`<title>`, `<meta>` and `<link>` are rendered by the component or route that owns them; no head library, and no effect writing to the document head.
**Why:** React hoists them into the head, so metadata lives beside what it describes.
**Check:** review
**Tags:** ux
**Implements:** `document-metadata-owned-by-screen`

## no-raw-html-injection · MUST
No raw HTML is injected; untrusted markup goes through a sanitising renderer.
**Why:** injected HTML runs whatever script it carries, in the user's session.
**Check:** tool — lint
**Tags:** security
**Implements:** `untrusted-input-parsed-at-edge`
