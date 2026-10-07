# Requests

> Governs how a request is followed, cancelled and kept apart from long work.

## Handles

### call-handle-random-and-never-a-credential · MUST
A value that relates one request to the next — a cursor, a session's id, a handle an operation minted — is random and never authenticates.

| Why | Tags |
|---|---|
| a handle that can be guessed, or that stands in for a credential, lets anyone act as the caller who got it. | [security] |

## Cancellation

### abandoned-request-stops-its-work → outside-call-can-be-cancelled · SHOULD
A request its caller cancels or abandons — by a cancel message or a closed connection — stops its work and the calls it made, and sends nothing more.

| Why | Tags |
|---|---|
| work for a caller who left spends capacity and the quota of the systems it calls. | [performance] |

## Long work

### long-operation-answered-with-a-handle · SHOULD
An operation that may outlast a request answers at once with a handle the caller follows for its state and its result, never holding the request open until it ends.

| Why | Tags |
|---|---|
| a request held open for long work is cut by a proxy or a timeout, and its caller can neither learn the outcome nor retry safely. | [] |
