# Remote data

> Governs remote data on a device that may go offline: what a device program serves from its cache, and what becomes of a write it takes offline.

## Cache

### cached-remote-data-served-offline · SHOULD

Every piece of remote data a device program has cached is served while the device is offline, even after the program restarts.

| Why |
|---|
| a device goes offline often, on a train, underground or where the signal drops, and a program that is useless without the network fails its user each time. |

### offline-remote-data-carries-its-fetch-time · SHOULD

Every piece of remote data a device program serves offline shows its user the time it was fetched.

| Why |
|---|
| a value served from the cache looks as fresh as one just fetched, and a user who cannot tell its age acts on data that changed long ago. |

## Writes

### offline-write-queued-or-refused · MUST

Every write a device program takes while offline is queued or refused, never dropped silently. It is queued durably and sent when the network returns, or refused at once with its reason.

| Why |
|---|
| a write the user believes made and the program quietly lost is data lost without anyone knowing to make it again. |
