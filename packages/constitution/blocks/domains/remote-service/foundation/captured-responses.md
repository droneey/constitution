# Captured responses

> Governs the captured responses that stand in for another system in a spec.

## General

### captured-response-verified-against-its-system · SHOULD

A captured response is verified against the system that gave it. It is captured again and any difference is reported; a system of the same repository is checked against its own contract instead.

| Why |
|---|
| a remote system changes its answers without telling anyone, and a spec on an old capture keeps passing while the program breaks — contract testing. |

### unmatched-request-fails-the-spec → test-runs-in-a-sandbox · MUST

A request no captured response matches fails the spec. The transport replaced by captured responses fails on it, naming its method and address.

| Why |
|---|
| a request nobody captured otherwise gets an empty answer, and the spec passes on code that would fail against the real system — fail fast. |
