# Access control

> Governs signing in through an identity provider on a phone or tablet.

## Sign-in

### provider-sign-in-runs-in-the-systems-browser → sign-in-through-a-provider-uses-code-with-pkce · MUST

Sign-in through an outside identity provider runs in the system's authentication session — ASWebAuthenticationSession on iOS, Custom Tabs on Android — never in a WebView the app embeds.

| Why |
|---|
| a WebView the app controls can read the password typed into it, and its user can neither see the address they sign in to nor reuse the session their browser holds. |
