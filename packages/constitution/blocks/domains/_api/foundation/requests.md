# Requests

> Governs how a request is followed, cancelled and kept apart from long work.

## Handles

### call-handle-random-and-never-a-credential · MUST

A handle that relates one request to the next is unguessable and never a credential, and one expired or unknown is answered as such. Such a handle — an operation's or a task's — never authenticates the caller by itself, and when expired or unknown is answered as an expected failure that says so.

| Why |
|---|
| a handle that can be guessed, or that stands in for a credential, lets anyone act as the caller who got it, and a caller recovers from an expired one only if the answer says it expired. |

## Cancellation

### abandoned-request-stops-its-work → outside-call-can-be-cancelled · SHOULD

An abandoned request stops its work. A request its caller cancels or abandons — by a cancel message or a closed connection — stops its work and the calls it made, and sends nothing more.

| Why |
|---|
| work for a caller who left spends capacity and the quota of the systems it calls. |

## Long work

### long-operation-answered-with-a-handle · SHOULD

An operation that may outlast a request answers at once with a handle. The caller follows the handle for its state and its result, and the request is never held open until the operation ends.

| Why |
|---|
| a request held open for long work is cut by a proxy or a timeout, and its caller can neither learn the outcome nor retry safely. |
