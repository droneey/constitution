# Accounts

> Governs signing in through an identity provider on a phone or tablet.

## Sign-in

### provider-sign-in-runs-in-the-systems-browser → sign-in-through-a-provider-uses-code-with-pkce · MUST

Every sign-in through an outside identity provider runs in a browser session the system keeps apart from the app. It never runs in a web view the app embeds.

#### Why

A web view the app controls can read the password typed into it, and its user can neither see the address they sign in to nor reuse the session their browser holds.

#### Examples

```swift title="Avoid"
func startSignIn(at authorizationURL: URL) {
    let webView = WKWebView(frame: view.bounds)

    view.addSubview(webView)
    webView.load(URLRequest(url: authorizationURL))   // the app can read the password typed here
}
```

```swift title="Prefer"
func startSignIn(at authorizationURL: URL, completion: @escaping ASWebAuthenticationSession.CompletionHandler) {
    let session = ASWebAuthenticationSession(
        url: authorizationURL,
        callback: .https(host: "shop.example", path: "/oauth/callback"),
        completionHandler: completion
    )

    session.presentationContextProvider = self
    signInSession = session
    session.start()
}
```
