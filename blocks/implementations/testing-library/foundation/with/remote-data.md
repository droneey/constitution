# Testing Library with remote data

> Specs of screens that read and change data another system owns, through a transport they replace.

## spec-cache-client-fresh-without-retries → specs-independent-of-order · MUST
Each spec builds its own cache client, with its retries off, and no client is shared between specs.

| Why | Check | Tags |
|---|---|---|
| nothing leaks from one spec's cache into the next, and a failed answer fails the case at once instead of being retried. | review | [] |

## render-helper-replaces-the-transport → ui-specs-replace-the-transport
The render helper replaces the transport with captured responses.

| Why | Check | Tags |
|---|---|---|
| every spec then runs against answers the vendor really gave. | review | [] |
