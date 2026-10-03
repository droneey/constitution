# TanStack Start

## hashed-assets-immutable-html-revalidated · SHOULD
Hashed assets are served as immutable; the HTML, the runtime configuration and the embed entries are revalidated.

| Why | Check | Tags |
|---|---|---|
| hashed files never change, so they are cached for good, while what points at them must be fresh. | review | [performance] |

## content-security-policy-set-in-route-rules → strict-content-security-policy
Nitro's `routeRules` set the Content Security Policy on every document, beside the caching rules, and the policy allows the shell's inline scripts by hash; a test reads the policy the server sends.

| Why | Check | Tags |
|---|---|---|
| the policy then lives in one configuration with the program, not in a proxy nobody here sees, and a test proves it is sent. | test | [security] |

## security-headers-set-in-route-rules → documents-sent-with-security-headers
The same `routeRules` set the other security headers, and the same test reads them.

| Why | Check | Tags |
|---|---|---|
| one place for every header keeps them from drifting apart, and the test covers them all. | test | [security] |
