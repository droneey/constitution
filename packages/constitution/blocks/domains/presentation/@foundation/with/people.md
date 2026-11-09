# People

> Governs the controls of processing consent a screen offers, and the sign that an opt-out was honoured.

## Controls

### consent-changed-from-every-screen · MUST

Wherever the product asks for processing consent, the way to change it is reachable from every screen.

#### Why

A choice changed only from one place is out of reach wherever the person is, so withdrawing becomes harder than giving was.

#### Examples

```pseudo title="Avoid"
# presentation/screens/privacy-screen
Button(label: "Change cookie choices", onPress: openConsentPanel)
```

```pseudo title="Prefer"
# presentation/components/app-shell
Footer(
  Link(label: "Privacy", to: "/privacy"),
  Button(label: "Change cookie choices", onPress: openConsentPanel)
)
```

### refusal-shown-beside-consent · MUST

Every control that refuses processing consent sits beside the one that accepts, with the same size and the same weight.

#### Why

A refusal drawn smaller or fainter than the processing consent beside it steers the user to accept.

#### Examples

```pseudo title="Avoid"
ConsentBanner(
  actions: [
    Button(label: "Accept all", variant: Primary, onPress: acceptAll),
    Link(label: "Manage settings", size: Small, onPress: openSettings)
  ]
)
```

```pseudo title="Prefer"
ConsentBanner(
  actions: [
    Button(label: "Reject all", variant: Primary, onPress: rejectAll),
    Button(label: "Accept all", variant: Primary, onPress: acceptAll),
    Link(label: "Manage settings", onPress: openSettings)
  ]
)
```

### blocked-content-loads-on-the-persons-click · SHOULD

Every piece of third-party content waiting for processing consent loads on the person's click.

#### Why

Without a way to load it in place the person meets a gap where the content matters to them, and must decide elsewhere.

#### Examples

```pseudo title="Avoid"
component StoreMap({ store })
  if not consent.allows(MapsProvider) then
    return Text("Accept cookies to see the map.")

  return EmbeddedMap(location: store.location)
```

```pseudo title="Prefer"
component StoreMap({ store })
  let [isLoaded, setIsLoaded] = state(consent.allows(MapsProvider))

  if not isLoaded then
    return BlockedContent(
      description: "Loading the map sends your IP address to MapsProvider.",
      action: Button(label: "Load map", onPress: function() setIsLoaded(true))
    )

  return EmbeddedMap(location: store.location)
```

### blocked-content-placeholder-says-what-loading-shares · SHOULD

Every piece of third-party content waiting for processing consent leaves a placeholder that says what loading it shares and with whom.

#### Why

A person who clicks a bare placeholder decides without knowing what loading the content costs them.

#### Examples

```pseudo title="Avoid"
BlockedContent(
  description: "This content is blocked.",
  action: Button(label: "Load video", onPress: loadVideo)
)
```

```pseudo title="Prefer"
BlockedContent(
  description: "Loading this video sends your IP address and a cookie to VideoHost.",
  action: Button(label: "Load video", onPress: loadVideo)
)
```

### honoured-opt-out-shown · MUST

Wherever the law that binds the product asks it, every person can see that their opt-out preference signal was honoured.

#### Why

A choice the person cannot see honoured is a choice they cannot trust — California's 11 CCR §7025(c)(6).

#### Examples

```pseudo title="Avoid"
component PrivacyChoices({ request })
  if request.hasOptOutSignal then
    call consent.optOutOfSale()

  return SaleOptOutToggle()
```

```pseudo title="Prefer"
component PrivacyChoices({ request })
  if request.hasOptOutSignal then
    call consent.optOutOfSale()

    return Notice("Opt-out request honored: your browser's privacy signal stopped the sale of your data.")

  return SaleOptOutToggle()
```
