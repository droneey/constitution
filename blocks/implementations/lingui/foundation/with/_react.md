# Lingui with React

> Messages in React components.

## components-take-t-from-use-lingui → messages-through-lingui-macros · MUST
A component takes `t` from `useLingui`, never the global one.

| Why | Check | Tags |
|---|---|---|
| a global `t` does not re-render the component when the locale changes. | review | [] |
