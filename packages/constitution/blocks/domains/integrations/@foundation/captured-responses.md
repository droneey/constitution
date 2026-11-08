# Captured responses

> Governs the captured responses that stand in for another system in a spec.

## General

### captured-response-verified-against-its-system · SHOULD

Every captured response is verified against the system that gave it: it is captured again and any difference is reported. Exempt: a system of the same repository, which is checked against its own contract.

| Why |
|---|
| a remote system changes its answers without telling anyone, and a spec on an old capture keeps passing while the program breaks — contract testing. |

### unmatched-request-fails-the-spec → test-runs-in-a-sandbox · MUST

Where a spec's remote transport serves captured responses, every request none of them matches fails the spec, naming its method and address.

| Why |
|---|
| a request nobody captured otherwise gets an empty answer, and the spec passes on code that would fail against the real system — fail fast. |
