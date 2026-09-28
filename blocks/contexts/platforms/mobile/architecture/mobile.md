# Mobile

## navigation-params-hold-view-state → untrusted-input-parsed-at-edge
View state a deep link or a restart must reproduce lives in the navigation parameters, and a deep link's parameters are parsed like any untrusted input.

| Why | Check | Tags |
|---|---|---|
| a deep link is input from outside the app, and a view that is not in its parameters cannot be linked or restored. | review | [data] |

## device-capabilities-behind-ports → real-effects-chosen-at-composition-root
Permissions, notifications, background work, secure storage and sensors are reached through adapters behind ports, never from a screen.

| Why | Check | Tags |
|---|---|---|
| each capability then has one place that asks for permission and handles refusal, and a test can fake it. | review | [] |
