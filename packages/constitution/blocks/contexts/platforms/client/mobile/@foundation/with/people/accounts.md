# Accounts

> Governs signing in through an identity provider on a phone or tablet.

## Sign-in

### provider-sign-in-runs-in-the-systems-browser → sign-in-through-a-provider-uses-code-with-pkce · MUST

Every sign-in through an outside identity provider runs in a browser session the system keeps apart from the app. It never runs in a web view the app embeds.

| Why |
|---|
| a web view the app controls can read the password typed into it, and its user can neither see the address they sign in to nor reuse the session their browser holds. |
