# Locale

> Governs how the locale is chosen, and what falls back.

## Choice and fallback

### locale-negotiated-from-the-user · MUST

The locale is negotiated from the user, never from the network address. It is chosen in this order: the user's explicit choice, their account's setting, the platform's preferred languages, then the product's default.

| Why |
|---|
| a locale guessed from an address fails travellers and people abroad, who then read a language they never chose. |

### missing-translation-falls-back · MUST

A missing translation falls back along the locale's chain and never shows its key. A message missing in the active locale falls back — `pt-BR`, then `pt`, then the source language.

| Why |
|---|
| a raw key on screen tells the user nothing, while the nearest language usually does. |
