# Localization

> Governs the capitals a screen shows, and how it offers a language.

## Capitals

### display-capitals-set-by-style → text-written-in-sentence-case · SHOULD

Every capital that only a screen's design asks for comes from its style, never from a catalogue message or from code.

#### Why

Capitals typed into a catalogue message, or set by the code that shows it, reach every screen and every language that shows it, while a style sets them only where the design wants them, by each language's own rules.

#### Examples

```pseudo title="Avoid"
# messages/en
checkout.sectionTitle = "ORDER SUMMARY"

# checkout/order-summary
Heading(messages.checkout.sectionTitle)
```

```pseudo title="Prefer"
# messages/en
checkout.sectionTitle = "Order summary"

# checkout/order-summary
Heading(messages.checkout.sectionTitle, style: { letterCase: Upper })
```

## Language choice

### language-offered-in-its-own-name · SHOULD

Every language is offered in its own name and script, such as "Українська" or "Deutsch", never by a flag.

#### Why

A reader finds their language by its name, and a flag names a country, which many languages share and many countries split.

#### Examples

```pseudo title="Avoid"
LanguagePicker(options: [
  { language: "en", icon: FlagUnitedKingdom },
  { language: "uk", icon: FlagUkraine },
  { language: "de", icon: FlagGermany }
])
```

```pseudo title="Prefer"
LanguagePicker(options: [
  { language: "en", label: "English" },
  { language: "uk", label: "Українська" },
  { language: "de", label: "Deutsch" }
])
```
