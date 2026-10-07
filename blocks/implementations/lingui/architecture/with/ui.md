# Lingui with UI

### lingui-only-where-text-is-rendered → domain-returns-codes-not-text · MUST
Lingui and the message catalogs have their home where text is rendered — a UI's components and widgets, the screens, and `root/`, which provides the active locale — and no other folder imports them: no domain, no binding unit, no adapter and no primitive of `libs/`.

| Why | Tags |
|---|---|
| the code below the presentation returns codes that each screen words for its locale, and a catalog in the primitives would put one application's text into a library every application shares. | [ux] |
