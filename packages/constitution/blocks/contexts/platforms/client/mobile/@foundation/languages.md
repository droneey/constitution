# Languages

> Governs the languages an app on a phone or tablet ships, as the system offers and keeps them: the languages it declares and the per-app language its user picks.

## Vocabulary

An app's **per-app language** is the language the system keeps for that app apart from the device's own languages, whether its user set it in the system's settings or inside the app.

## Declared languages

### app-languages-declared-to-the-system · SHOULD

Every language the app ships is declared to the system, which offers it as the app's per-app language.

#### Why

An app that declares no languages gets no per-app language in the system's settings, so its user changes the whole device's language to read it in another.

#### Examples

```xml title="Avoid"
<!-- app/src/main/AndroidManifest.xml -->
<application
    android:label="@string/app_name"
    android:supportsRtl="true"> <!-- declares no languages, so the system offers no per-app language -->
</application>
```

```xml title="Prefer"
<!-- app/src/main/res/xml/locales_config.xml -->
<locale-config xmlns:android="http://schemas.android.com/apk/res/android">
    <locale android:name="en" />
    <locale android:name="pl" />
    <locale android:name="uk" />
</locale-config>

<!-- app/src/main/AndroidManifest.xml -->
<application
    android:label="@string/app_name"
    android:localeConfig="@xml/locales_config"
    android:supportsRtl="true">
</application>
```

## Picked language

### language-picked-in-the-app-kept-by-the-system · SHOULD

Every language picked inside the app is kept by the system as its per-app language, never stored by the app itself. The app hands the choice to the system or, on a system that lets no app set its per-app language, its picker opens the app's page in the system's settings. Exempt: a system with no per-app language and no page to set one, such as Android before 13, where the choice is kept by the platform's compatibility library, which hands it to the system once the system has one.

#### Why

A choice the app stores beside the system's is a second store of one choice, which soon disagrees with the first, and a person looks for the app's language where they set every other app's — a single source of truth.

#### Examples

```kotlin title="Avoid"
fun onLanguagePicked(languageTag: String) {
    preferences.edit { putString("language", languageTag) }   // a second store of the system's choice
    activity.recreate()
}
```

```kotlin title="Prefer"
fun onLanguagePicked(languageTag: String) {
    AppCompatDelegate.setApplicationLocales(LocaleListCompat.forLanguageTags(languageTag))
}
```
