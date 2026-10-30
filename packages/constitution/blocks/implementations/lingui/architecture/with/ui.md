# User interface

> Governs where the catalogs and Lingui are imported in an interface.

## General

### lingui-only-where-text-is-rendered → domain-returns-codes-not-text · MUST

Lingui and the message catalogs have their home where text is rendered — a presentation's screens, widgets and components, and `root/`, which provides the active locale — and no other folder imports them: no domain, no application, no binding unit, no adapter and no primitive of `libs/`.

| Why |
|---|
| the code below the presentation returns codes that each screen words for its locale, and a catalog in the primitives would put one application's text into a library every application shares. |
