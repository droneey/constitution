# Bodies

> Governs the type of every body, an uploaded file's included.

## General

### answer-declares-its-exact-content-type · MUST

Every answer carries its exact `Content-Type`, and an operation that answers JSON never answers `text/html`, its failures and the framework's defaults included.

| Why |
|---|
| a client that knows the type parses the body as it was meant, and an HTML answer from an API is a page a browser may run. |

### answer-forbids-type-sniffing · MUST

Every answer carries `X-Content-Type-Options: nosniff`.

| Why |
|---|
| a browser that guesses the type of an answer holding a caller's text may run it as a page. |

### request-body-refused-in-an-undeclared-type · MUST

A request whose body is in a media type its operation does not declare is refused with `415` before it is read; an operation of JSON never accepts `text/plain` or a form encoding.

| Why |
|---|
| a page on another origin sends `text/plain` and form bodies without a preflight, so an API that reads them as JSON accepts forged writes. |

### uploaded-file-never-rendered-from-the-programs-origin · MUST

A file a person uploaded is served from another registrable domain than the program's, or with `Content-Disposition: attachment` or `Content-Security-Policy: sandbox`; it is never opened as a page of the program's own origin.

| Why |
|---|
| an uploaded SVG or HTML page opened from the program's origin, or from a sibling host of its site, runs its script with every visitor's session. |
