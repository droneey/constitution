# Matomo with privacy

> Governs what Matomo does before consent.

### matomo-waits-for-consent → processing-waits-for-its-consent · MUST
Where the law subjects the measurement to consent, `requireConsent` is set before the first push and tracking starts only on the consent the user gave; elsewhere tracking is cookieless and anonymised — `disableCookies`, the address masked.

| Why | Tags |
|---|---|
| without it, Matomo tracks from the first page view, before the user has chosen. | [] |
