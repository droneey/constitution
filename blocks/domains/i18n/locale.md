# Locale

> Governs how the locale is chosen and what falls back.

## Choice and fallback

### locale-negotiated-from-the-user · MUST
The locale is chosen in this order: the user's explicit choice, their account's setting, the platform's preferred languages, then the product's default — never from the network address.

| Why | Tags |
|---|---|
| a locale guessed from an address fails travellers and people abroad, who then read a language they never chose. | [ux] |

### missing-translation-falls-back · MUST
A message missing in the active locale falls back along the locale's chain — `pt-BR`, then `pt`, then the source language — and never shows its key.

| Why | Tags |
|---|---|
| a raw key on screen tells the user nothing, while the nearest language usually does. | [ux] |
