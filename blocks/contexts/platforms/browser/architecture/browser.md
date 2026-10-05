# Browser

## server-rendering-is-delivery-only · MUST
The program's logic runs in the tab. Server rendering, when it is on, only speeds the first paint: no business logic, no data access and no server function lives on the web tier, except one session proxy — it exchanges the user's sign-in for tokens, keeps them on the server behind a session cookie its script cannot read and forwards calls to the API, with no business rule and no shaping of data.

| Why | Check | Tags |
|---|---|---|
| a web tier with logic of its own is a second backend nobody designed, with its own secrets and failures. | review | [] |

## served-configuration-read-at-boot → environment-read-once-at-boot · MUST
In the tab, the configuration served beside the bundle is the environment the configuration provider reads.

| Why | Check | Tags |
|---|---|---|
| the program then depends on one typed configuration, and a missing or malformed setting fails at start in every environment alike. | review | [] |
