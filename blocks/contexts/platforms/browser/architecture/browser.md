# Browser

## server-rendering-is-delivery-only · MUST
The program's logic runs in the tab. Server rendering, when it is on, only speeds the first paint: no business logic, no data access and no server function lives on the web tier, except one session proxy — it exchanges the user's sign-in for tokens, keeps them on the server behind a cookie as `no-credential-readable-by-script` sets it and forwards calls to the API, with no business rule and no shaping of data.

| Why | Check | Tags |
|---|---|---|
| a web tier with logic of its own is a second backend nobody designed, with its own secrets and failures. | review | [] |

## served-configuration-read-at-boot → environment-read-once-at-boot · MUST
In the tab, the configuration served beside the bundle is the environment: the configuration provider reads it once, at boot.

| Why | Check | Tags |
|---|---|---|
| the program then depends on one typed configuration, and a missing or malformed setting fails at start in every environment alike. | review | [] |

## cross-window-messages-check-origin → untrusted-input-parsed-at-edge
A message from another window is accepted only from an expected origin, and parsed; an outgoing message names its target origin.

| Why | Check | Tags |
|---|---|---|
| any page can post a message to any window; without the origin check, any page can drive the program. | review | [] |

## no-raw-html-injection → untrusted-input-parsed-at-edge
No raw HTML reaches the DOM: no `innerHTML` or `outerHTML` assigned, no `insertAdjacentHTML`, no `document.write`. Untrusted markup goes through a sanitising renderer.

| Why | Check | Tags |
|---|---|---|
| injected HTML runs whatever script it carries, in the user's session. | tool/lint | [security] |
