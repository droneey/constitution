# Locale

> Governs how the locale is chosen, and what falls back.

## Vocabulary

The **active locale** is the locale chosen for the person the text or the value is for.

## Choice and fallback

### locale-negotiated-from-the-user · MUST

The active locale is chosen from its user, never from their network address. It is chosen in this order: the user's explicit choice, their account's setting, the platform's preferred languages, then the product's default.

#### Why

A locale guessed from an address fails travellers and people abroad, who then read a language they never chose.

#### Examples

```pseudo title="Avoid"
# presentation/locale/choose-locale
function chooseLocale(request, account)
  return localeOfCountry(countryOfAddress(request.address))
```

```pseudo title="Prefer"
# presentation/locale/choose-locale
function chooseLocale(request, account)
  return request.chosenLocale
    ?? account?.locale
    ?? negotiate(request.preferredLanguages, supportedLocales)
    ?? defaultLocale
```

### missing-translation-falls-back · MUST

Every catalogue message missing in the active locale falls back along the locale's chain, never showing its key. The chain runs from the locale to its parent and then to the source language, such as pt-BR, then pt, then the source.

#### Why

A raw key on screen tells the user nothing, while the nearest language usually does.

#### Examples

```pseudo title="Avoid"
# presentation/locale/lookup
function lookup(key, locale)
  return catalogues[locale][key] ?? key  # shows "cart.emptyTitle"
```

```pseudo title="Prefer"
# presentation/locale/lookup
function lookup(key, locale)
  for candidate in [locale, parentOf(locale), sourceLocale]
    let text = catalogues[candidate][key]

    if text is not <absent> then
      return text
```
