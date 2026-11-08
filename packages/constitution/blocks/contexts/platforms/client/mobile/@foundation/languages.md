# Languages

> Governs the languages an app on a phone or tablet ships, as the system offers and keeps them: the languages it declares and the per-app language its user picks.

## Vocabulary

An app's **per-app language** is the language the system keeps for that app apart from the device's own languages, whether its user set it in the system's settings or inside the app.

## Declared languages

### app-languages-declared-to-the-system · SHOULD

Every language the app ships is declared to the system, which offers it as the app's per-app language.

| Why |
|---|
| an app that declares no languages gets no per-app language in the system's settings, so its user changes the whole device's language to read it in another. |

## Picked language

### language-picked-in-the-app-kept-by-the-system · SHOULD

Every language picked inside the app is kept by the system as its per-app language, never stored by the app itself. The app hands the choice to the system or, on a system that lets no app set its per-app language, its picker opens the app's page in the system's settings.

| Why |
|---|
| a choice the app stores beside the system's is a second store of one choice, which soon disagrees with the first, and a person looks for the app's language where they set every other app's — a single source of truth. |
