# Mobile

## deep-link-params-parsed-as-untrusted-input → untrusted-input-parsed-at-edge
A deep link's parameters are parsed like any untrusted input.

| Why | Check | Tags |
|---|---|---|
| a deep link is input from outside the app, which anyone can write. | review | [data] |

## device-capabilities-behind-ports → real-effects-chosen-at-composition-root
Permissions, notifications, background work, secure storage and sensors are reached through adapters behind ports, never from a screen.

| Why | Check | Tags |
|---|---|---|
| each capability then has one place that asks for permission and handles refusal, and a test can fake it. | review | [] |
