# Matomo with privacy

> Governs what Matomo does before consent.

### matomo-waits-for-consent → processing-waits-for-its-consent · MUST
`requireConsent` is set before the first push, and tracking starts only on the consent the user gave.

| Why | Tags |
|---|---|
| without it, Matomo tracks from the first page view, before the user has chosen. | [] |
