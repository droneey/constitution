# shadcn with a design system

> Governs the text of the primitives shadcn installs.

### shadcn-text-passed-by-props → primitives-take-text-by-props · MUST
The text shadcn source ships — a screen reader's "Close" among it — is removed on arrival, and the component takes it by a prop.

| Why | Tags |
|---|---|
| the shipped strings are English and fixed, so a kit that keeps them speaks one language whatever the program's locale. | [] |
