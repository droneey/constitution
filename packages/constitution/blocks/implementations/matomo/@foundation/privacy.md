# Privacy

> Governs what Matomo does before consent and after an objection.

## General

### matomo-waits-for-consent → processing-waits-for-its-consent · MUST

Wherever the law that binds the product subjects Matomo's measurement to consent, `requireConsent` is set before the first push. Tracking then starts only on the consent the person gave.

| Why |
|---|
| without it, Matomo tracks from the first page view, before the person has chosen. |

### matomo-measures-cookieless-without-consent → processing-waits-for-its-consent · MUST

Every measurement Matomo makes without the person's consent stores nothing on their device, `disableCookies` or `requireCookieConsent` being set before the first push.

| Why |
|---|
| Matomo sets its cookies from the first page view unless told otherwise, and a cookie set where no consent was asked stores on the device what only consent would allow. |

### matomo-objection-keeps-the-tracker-off → objection-honoured · MUST

Every person's objection keeps Matomo off in that browser, from the next event until the person takes it back. Where tracking runs without consent, `optUserOut` records the objection and `forgetUserOptOut` takes it back; their `mtm_consent_removed` cookie, which holds no measurement, is the one cookie the tracker still sets under `disableCookies`.

| Why |
|---|
| anonymous measurement rests on the program's legitimate interest, which a person may object to, and an objection the next page forgets is not honoured. |
