# React

> Governs messages in React components.

## General

### components-take-t-from-use-lingui · MUST

Every component renders its descriptors through the `i18n` or the `t` that `useLingui` returns, never the global one.

| Why |
|---|
| a global `t` does not re-render the component when the locale changes, so the component shows the old locale's text until something else renders it. |
