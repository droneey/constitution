# Matomo with privacy

> Governs what Matomo does before consent and after an objection.

### matomo-waits-for-consent → processing-waits-for-its-consent · MUST

Where the law subjects the measurement to consent, `requireConsent` is set before the first push and tracking starts only on the consent the user gave; elsewhere tracking is cookieless and anonymised — `disableCookies`, the address masked.

| Why | Tags |
|---|---|
| without it, Matomo tracks from the first page view, before the user has chosen. | [] |

### matomo-objection-keeps-the-tracker-off → objection-honoured · MUST

Where tracking runs without consent, a person's objection stops it before the next event and is kept by the program, which loads no tracker in that browser until they take the objection back; `optUserOut` alone does not keep it, since it stores the objection in a cookie and `disableCookies` turns every cookie off.

| Why | Tags |
|---|---|
| anonymous measurement rests on the program's legitimate interest, which a person may object to, and an objection the next page forgets is not honoured. | [] |
