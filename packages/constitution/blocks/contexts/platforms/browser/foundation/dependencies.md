# Dependencies

> Governs scripts from other origins, the supported browsers and the features beyond them.

## General

### script-from-another-origin-pinned · SHOULD

A script from another origin is served from the program's own origin, or loaded with `integrity` and `crossorigin`; a script that changes by design, such as a tag manager's container, loads only through a loader the Content Security Policy allows by nonce or hash with `strict-dynamic`, with the reason beside it.

| Why |
|---|
| a script on another server changes when that server does; with its hash pinned, the browser refuses a replaced file. |

### supported-browsers-declared-as-a-baseline-target · SHOULD

The browsers the program supports are declared once, as a Baseline target — Baseline widely available or a Baseline year — and the build, the checks and the polyfills read that one declaration.

| Why |
|---|
| a target named by Baseline moves with the web platform instead of a list of versions nobody updates, and one declaration keeps the build and the checks from supporting different browsers. |

### feature-beyond-the-target-detected-first · SHOULD

A feature of the web platform the declared target does not cover is used only behind a check that the browser has it, with a fallback or a polyfill the entry file loads.

| Why |
|---|
| a browser the program supports but that lacks the feature would otherwise break the screen that uses it. |
