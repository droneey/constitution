# Remote data

> Governs remote data on a device that is often offline.

## Cache

### cached-remote-data-served-offline · SHOULD

Remote data the app has cached is served offline, at start included, each value with the time it was fetched.

| Why |
|---|
| a phone is offline often, an app that is useless without the network fails its user every day, and the time tells them how old what they see is. |

### offline-write-queued-or-refused · MUST

A write made offline is queued durably and sent when the network returns, or refused at once with its reason; none is dropped silently.

| Why |
|---|
| a write the user believes made and the app quietly lost is data lost without anyone knowing to make it again. |
