# Consent

> Governs processing consent: when it is asked, what waits for it, how it is given, recorded and withdrawn.

## Vocabulary

**Processing consent** is a person's go-ahead to a purpose of processing their personal data, in the sense of the law that binds the product.

## What is asked

### consent-asked-only-where-the-law-requires-it · SHOULD

Processing consent is asked only for a processing that the law that binds the product subjects to it. Such processing includes storing on or reading from the device what the service the person asked for does not need, tracking across sites and advertising. Exempt: a purpose whose basis in the inventory is processing consent, chosen by the product though that law offers another.

#### Why

A request for processing consent the law does not ask wears people down into clicking through every request, the ones that matter included.

#### Examples

```text title="Avoid"
Allow these?
  [ ] Session cookie that keeps your cart
  [ ] Analytics
  [Accept]  [Refuse]
```

```text title="Prefer"
Allow these?
  [ ] Analytics
  [Accept]  [Refuse]
```

## Before consent

### processing-waits-for-its-consent · MUST

Every processing that needs processing consent waits until the person consents to its purpose. Until then nothing is stored on or read from their device for it, no identifier is set, and no request reaches its third party, such as an embedded video, a map, a chat box, a social button or an advertising pixel.

#### Why

A product that tracks first and asks later has already taken the choice from the person.

#### Examples

```pseudo title="Avoid"
# presentation/consent/start
loadScript(analyticsScriptUrl)  # tracks before anyone was asked
showConsentBanner()
```

```pseudo title="Prefer"
# presentation/consent/start
showConsentBanner()

onConsentGiven("analytics", function()
  loadScript(analyticsScriptUrl))
```

### declined-consent-costs-nothing-else · MUST

Every declined processing consent changes nothing in the product beyond the processing declined.

#### Why

Processing consent paid for with a feature is not given freely, and the GDPR does not count it as given.

#### Examples

```text title="Avoid"
Analytics refused.

Wishlist
  Allow analytics to save
  items to your wishlist.
```

```text title="Prefer"
Analytics refused.

Wishlist
  3 items saved
```

## Asking

### refusal-as-easy-as-consent · MUST

Wherever processing consent is first asked, refusing takes no more steps than consenting.

#### Why

A refusal hidden behind a second step is processing consent taken, not given.

#### Examples

```text title="Avoid"
We use analytics and advertising.
  [Accept all]      Settings >
```

```text title="Prefer"
We use analytics and advertising.
  [Accept all]  [Refuse all]
  Settings >
```

### consent-given-per-purpose · MUST

Every processing consent is given for one purpose on its own, never for a bundle of purposes.

#### Why

A bundle of purposes is processing consent taken, not given, for every purpose the person would have refused alone.

#### Examples

```text title="Avoid"
Allow these?
  [ ] Analytics and advertising
  [Save]
```

```text title="Prefer"
Allow these?
  [ ] Analytics
  [ ] Advertising
  [Save]
```

### consent-purpose-never-preselected · MUST

No purpose of processing consent is preselected.

#### Why

A box ticked in advance is processing consent taken, not given.

#### Examples

```text title="Avoid"
Allow these?
  [x] Analytics
  [x] Advertising
  [Save]
```

```text title="Prefer"
Allow these?
  [ ] Analytics
  [ ] Advertising
  [Save]
```

## Record and withdrawal

### consent-withdrawn-as-easily-as-given · MUST

Every processing consent can be withdrawn at any time, as easily as it was given.

#### Why

Processing consent that cannot be taken back as easily was never freely given.

#### Examples

```text title="Avoid"
given      one click on the banner
withdrawn  by mail to privacy@shop.example
```

```text title="Prefer"
given      one click on the banner
withdrawn  one click: Privacy settings,
           in every page's footer
```

### withdrawn-consent-stops-its-processing · MUST

Every withdrawn processing consent stops at once the processing it allowed.

#### Why

A processing that goes on after its processing consent is withdrawn runs with no legal basis, on data the person has taken back.

#### Examples

```pseudo title="Avoid"
# consent/application/use-cases/commands/withdraw-consent.use-case
function createWithdrawConsent({ consentChoices, clock })
  return function(input, context)
    await consentChoices.save(withdrawal(input.visitorId, input.purpose, clock.now()), context)  # the tracker runs on until the next visit
```

```pseudo title="Prefer"
# consent/application/use-cases/commands/withdraw-consent.use-case
function createWithdrawConsent({ consentChoices, trackers, clock })
  return function(input, context)
    await consentChoices.save(withdrawal(input.visitorId, input.purpose, clock.now()), context)
    await trackers.stop(input.purpose, context)
```

### consent-choice-recorded · MUST

Every processing consent choice is recorded with its time and its purposes. A choice is a processing consent, a refusal or a withdrawal.

#### Why

A choice left unrecorded cannot be proven the person's when the GDPR asks the program to show it.

#### Examples

```pseudo title="Avoid"
# consent/application/use-cases/commands/record-consent-choice.use-case
function createRecordConsentChoice({ consentChoices })
  return function(input, context)
    await consentChoices.save({ visitorId: input.visitorId, accepted: input.accepted }, context)  # no time, no purposes
```

```pseudo title="Prefer"
# consent/application/use-cases/commands/record-consent-choice.use-case
function createRecordConsentChoice({ consentChoices, clock })
  return function(input, context)
    await consentChoices.save({
      visitorId: input.visitorId,
      kind: input.kind,
      purposes: input.purposes,
      madeAt: clock.now()
    }, context)
```

### refusal-respected-for-the-set-period · SHOULD

No recorded refusal is asked about again within the period the project sets. Exempt: a change of the purposes, which asks again sooner.

#### Why

Asking again after a refusal wears the person down into a processing consent that is not free, and France's CNIL recommends six months.

#### Examples

```pseudo title="Avoid"
# presentation/consent/should-ask
function shouldAsk(visitor)
  return not visitor.hasConsented  # asked again on every visit after a refusal
```

```pseudo title="Prefer"
# presentation/consent/should-ask
function shouldAsk(visitor, now)
  let refusal = visitor.lastRefusal

  if refusal is <absent> or refusal.purposes != currentPurposes then
    return not visitor.hasConsented

  return now - refusal.madeAt >= askAgainAfterRefusal
```
