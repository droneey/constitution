# Presentation

> Governs the input and output a TypeScript component never reaches.

## Components

### component-reaches-no-io-global → effects-held-only-by-the-edge · MUST

No file in a `components/` folder calls an input or output global. Such a global is one the runtime offers every module without an import, such as `fetch`.

| Why |
|---|
| such a global reaches a component without an import, so nothing at the top of its file shows the effect, the import rules that keep effects at the edge never see it, and a component that fetches can no longer be shown or tested with plain data. |
