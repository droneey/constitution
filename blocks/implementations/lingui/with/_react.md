# Lingui with React

> Messages in React components.

### components-take-t-from-use-lingui · MUST
A component takes `t` from `useLingui`, never the global one.

| Why | Tags |
|---|---|
| a global `t` does not re-render the component when the locale changes. | [ux] |
