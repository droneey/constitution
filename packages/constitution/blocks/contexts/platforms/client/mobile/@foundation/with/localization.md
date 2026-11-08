# Localization

> Governs the locale of an app on a phone or tablet: the place of its per-app language in the order its locale is chosen in.

## Locale

### locale-read-from-the-systems-per-app-language → locale-negotiated-from-the-user · MUST

Every app takes its per-app language as its user's explicit choice. It reads that language when it starts and again whenever it changes.

#### Why

The per-app language is the person's explicit choice, made where they expect to make it, and an app that reads only the device's languages, or reads its per-app language only at its start, overrides it.

#### Examples

```kotlin title="Avoid"
@Composable
fun PriceText(price: Money) {
    val locale = Resources.getSystem().configuration.locales[0]   // the device's language, not the app's

    Text(price.format(locale))
}
```

```kotlin title="Prefer"
@Composable
fun PriceText(price: Money) {
    val locale = LocalConfiguration.current.locales[0]

    Text(price.format(locale))
}
```
