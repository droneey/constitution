# Remote service

> Governs how the app reaches the systems it calls and the oldest version of it they support.

## Calls

### traffic-sent-only-over-tls → call-runs-over-verified-tls · MUST

Every connection the app opens runs over TLS and trusts only the system's certificate authorities: App Transport Security keeps its defaults, Android's network configuration refuses cleartext, and an exception names its host and its reason.

| Why |
|---|
| a phone joins networks its user does not control, where plain traffic is read and changed by anyone on the path. |

## Versions

### unsupported-app-version-asks-to-update · SHOULD

The app learns the oldest version of itself its server still supports and, below it, asks its user to update before going on.

| Why |
|---|
| an installed app is updated only when its user chooses, so a fix for a flaw, or a change of the server's format, reaches every user only through a floor the server sets. |
