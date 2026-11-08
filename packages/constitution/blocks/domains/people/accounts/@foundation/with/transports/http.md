# HTTP

> Governs the cookie that carries a session, and the origins a sign-in is taken from.

## Vocabulary

A **session cookie** is the cookie in which the server keeps the session of a caller signed in from a browser.

## Cookies

### session-cookie-closed-to-script · MUST

Every session cookie is set `HttpOnly`.

#### Why

A cookie a script can read is taken by the first script injected into the page.

#### Examples

```text title="Avoid"
Set-Cookie: __Host-session=k7Qm2xV9; Path=/; Secure; SameSite=Lax
```

```text title="Prefer"
Set-Cookie: __Host-session=k7Qm2xV9; Path=/; Secure; HttpOnly; SameSite=Lax
```

### session-cookie-sent-only-over-tls · MUST

Every session cookie is set `Secure`.

#### Why

A cookie sent over plain HTTP is read by whoever watches the network.

#### Examples

```text title="Avoid"
Set-Cookie: session=k7Qm2xV9; Path=/; HttpOnly; SameSite=Lax
```

```text title="Prefer"
Set-Cookie: __Host-session=k7Qm2xV9; Path=/; Secure; HttpOnly; SameSite=Lax
```

### session-cookie-held-back-from-cross-site-requests · MUST

Every session cookie is set `SameSite=Lax` or `Strict`, so that it rides on no request another site starts but a top-level navigation.

#### Why

A cookie carried on a request another site starts in the background acts for that site.

#### Examples

```text title="Avoid"
Set-Cookie: __Host-session=k7Qm2xV9; Path=/; Secure; HttpOnly; SameSite=None
```

```text title="Prefer"
Set-Cookie: __Host-session=k7Qm2xV9; Path=/; Secure; HttpOnly; SameSite=Lax
```

### session-cookie-carries-its-host-prefix · MUST

Every session cookie is named with the prefix that guards it from sibling hosts: `__Host-`, with `Path=/` and no `Domain`, when the program's own tier sets it, or `__Secure-` with the narrowest `Domain` when a sign-in service on a sibling host does.

#### Why

A cookie without the prefix is replaced by one a sibling host sets.

#### Examples

```text title="Avoid"
Set-Cookie: session=k7Qm2xV9; Domain=example.com; Path=/; Secure; HttpOnly; SameSite=Lax
```

```text title="Prefer"
Set-Cookie: __Host-session=k7Qm2xV9; Path=/; Secure; HttpOnly; SameSite=Lax
```

## Sign-in

### sign-in-refused-from-other-origins → state-changing-request-refused-from-other-origins · MUST

Every request that signs a person in with what they typed is refused from an origin the program does not trust. It is refused by the same check as a credentialed request that changes state. Exempt: the answer of an outside identity provider, which PKCE and, with OpenID Connect, its `nonce` guard.

#### Why

A sign-in posted from another site signs the person into the attacker's account, while the provider's answer comes from another site by design.

#### Examples

```pseudo title="Avoid"
# root/routes
let originCheck = refuseUntrustedOrigins({
  trusted: [AppOrigin],
  except: ["/sign-in"]   # no session yet, so taken as nothing to forge
})
```

```pseudo title="Prefer"
# root/routes
let originCheck = refuseUntrustedOrigins({
  trusted: [AppOrigin],
  # Why: the provider answers from its own origin; PKCE and the nonce guard it
  except: ["/sign-in/provider/callback"]
})
```
