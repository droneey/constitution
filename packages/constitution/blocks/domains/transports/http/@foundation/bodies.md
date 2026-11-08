# Bodies

> Governs the type of every body, an uploaded file's included.

## General

### answer-declares-its-exact-content-type · MUST

Every answer with a body carries its exact `Content-Type`.

| Why |
|---|
| a caller that knows the type parses the body as it was meant, while one left to guess it may take text another caller stored for a page and run it. |

### answer-forbids-type-sniffing · MUST

Every answer carries `X-Content-Type-Options: nosniff`.

| Why |
|---|
| a browser that guesses an answer's type from its content runs as a page or a script what the server declared as data. |

### data-operation-never-answers-a-page · MUST

Every operation that answers data, such as JSON, never answers `text/html`, its failures and the framework's default answers included.

| Why |
|---|
| a page an API answers, the framework's own error page among them, runs in the program's origin with whatever text of a caller it holds. |

### request-body-refused-in-an-undeclared-type · MUST

Every request body in a media type its operation does not declare is refused with `415`, before it is read. An operation of JSON, for one, accepts neither `text/plain` nor a form encoding.

| Why |
|---|
| a page on another origin sends `text/plain` and form bodies without a preflight, so an API that reads them as JSON accepts forged writes. |

## Uploads

### uploaded-file-never-rendered-from-the-programs-origin · MUST

No uploaded file is ever opened as a page of the program's own origin. A file a person uploaded is served from a registrable domain other than the program's, or with `Content-Disposition: attachment` or `Content-Security-Policy: sandbox`.

| Why |
|---|
| an uploaded SVG image or markup page opened from the program's origin, or from a sibling host of its site, runs its script with every visitor's session. |
