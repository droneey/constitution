# Accounts

> Governs the steps of signing in a screen asks, and how a screen warns of a session's end and keeps its input past it.

## Sign-in

### sign-in-needs-no-cognitive-test · MUST

No step of signing in asks a cognitive test, such as remembering a password, transcribing a code or solving a puzzle. Exempt: a step that offers another way past it, or whose answer the platform can fill or paste.

#### Why

A test of memory or reasoning shuts out people with cognitive disabilities, while the answer is often already on their device — WCAG 2.2, Accessible Authentication (Minimum).

#### Examples

```pseudo title="Avoid"
SignInForm(
  TextField(label: "Email", kind: Email, purpose: Username),
  TextField(label: "Password", kind: Password, purpose: CurrentPassword),
  Captcha(kind: DistortedText)  # no other way past it
)
```

```pseudo title="Prefer"
SignInForm(
  TextField(label: "Email", kind: Email, purpose: Username),
  TextField(label: "Password", kind: Password, purpose: CurrentPassword),
  Button(label: "Sign in with a passkey", onPress: signInWithPasskey)
)
```

## Sessions

### session-limits-warned-before-they-end · MUST

Every session limit, the absolute one included, warns its person before it ends.

#### Why

A session that ends without warning loses the work on the screen — WCAG 2.2, Timing Adjustable.

#### Examples

```pseudo title="Avoid"
onSessionEnded(function()
  navigation.open(SignInScreen))
```

```pseudo title="Prefer"
onSessionEndsIn(SESSION_WARNING_LEAD, function(session)
  showDialog(
    title: "Your session ends in " + formatDuration(session.remaining),
    actions: session.isExtendable
      ? [Button(label: "Stay signed in", onPress: session.extend)]
      : [Button(label: "Close", onPress: closeDialog)]
  ))

onSessionEnded(function()
  navigation.open(SignInScreen))
```

### short-session-ends-in-a-sign-in-that-keeps-the-input · MUST

Every absolute session limit of twenty hours or less ends in a sign-in that keeps every input the person made.

#### Why

An absolute limit nobody can extend, set short by a standard, loses the work on the screen unless the sign-in keeps it — WCAG 2.2, Timing Adjustable.

#### Examples

```pseudo title="Avoid"
onSessionEnded(function()
  navigation.replace(SignInScreen))  # the half-filled claim form is gone
```

```pseudo title="Prefer"
onSessionEnded(function()
  showDialog(SignInDialog(onSignedIn: function(session) currentSession.replace(session))))
```
