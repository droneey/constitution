# Remote service

> Governs how a client whose release its user holds keeps up with the services it calls.

## Releases

### client-below-the-oldest-supported-release-updates-first · SHOULD

A client below the oldest supported release updates before it goes on. That holds for any client whose release its user holds — an installed app, a tab left open —, which learns the oldest release of it its server still supports and, below it, moves to the current release.

| Why |
|---|
| the user, not the maker, decides when a held release changes, so a fix for a flaw, or a change of the server's format, reaches every user only through a floor the server sets and the client obeys. |
