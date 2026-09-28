# Browser

## server-rendering-is-delivery-only · MUST
The program's logic runs in the tab. Server rendering, when it is on, only speeds the first paint: no business logic, no data access and no server function lives on the web tier.
**Why:** a web tier with logic of its own is a second backend nobody designed, with its own secrets and failures.
**Check:** review

## served-configuration-read-at-boot · MUST
In the tab, the configuration served beside the bundle is the environment: the configuration provider reads it once, at boot.
**Why:** the program then depends on one typed configuration, and a missing or malformed setting fails at start in every environment alike.
**Check:** review
**Tags:** security
**Implements:** `environment-read-once-at-boot`

## cross-window-messages-check-origin · MUST
A message from another window is accepted only from an expected origin, and parsed; an outgoing message names its target origin.
**Why:** any page can post a message to any window; without the origin check, any page can drive the program.
**Check:** review
**Tags:** security
**Implements:** `untrusted-input-parsed-at-edge`
