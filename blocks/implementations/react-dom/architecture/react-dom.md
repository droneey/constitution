# React DOM

## no-raw-html-injection · MUST
No raw HTML is injected; untrusted markup goes through a sanitising renderer.
**Why:** injected HTML runs whatever script it carries, in the user's session.
**Check:** tool — lint
**Tags:** security
**Implements:** `untrusted-input-parsed-at-edge`
