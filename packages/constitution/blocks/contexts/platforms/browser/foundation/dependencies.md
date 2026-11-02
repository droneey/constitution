# Dependencies

> Governs scripts from other origins, the supported browsers and the features beyond them.

## General

### script-from-another-origin-pinned · SHOULD

A script from another origin is pinned. It is served from the program's own origin, or loaded with `integrity` and `crossorigin`; a script that changes by design, such as a tag manager's container, loads only through a loader the Content Security Policy allows by nonce or hash with `strict-dynamic`, with the reason beside it.

| Why |
|---|
| a script on another server changes when that server does, so whoever controls that server runs their code in the program's pages, unless the script's hash is pinned and the browser refuses the replaced file. |

### supported-browsers-declared-as-a-baseline-target · SHOULD

The supported browsers are declared once, as a Baseline target. The target is Baseline widely available or a Baseline year, and the build, the checks and the polyfills read that one declaration.

| Why |
|---|
| a list of versions nobody updates falls behind the web platform, and a second declaration lets the build and the checks support different browsers — a single source of truth. |

### feature-beyond-the-target-detected-first · SHOULD

A feature beyond the declared target is used only behind a check that the browser has it. Such a feature is one of the web platform the target does not cover, and the check comes with a fallback or a polyfill the entry file loads.

| Why |
|---|
| a browser the program supports but that lacks the feature would otherwise break the screen that uses it — progressive enhancement. |
