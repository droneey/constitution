# Remote service

> Governs how the app reaches the systems it calls.

## Calls

### traffic-sent-only-over-tls → call-runs-over-verified-tls · MUST

Every connection the app opens runs over TLS and trusts only the system's certificate authorities: App Transport Security keeps its defaults, Android's network configuration refuses cleartext, and an exception names its host and its reason.

| Why |
|---|
| a phone joins networks its user does not control, where plain traffic is read and changed by anyone on the path. |
