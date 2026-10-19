# User interface

> Governs the input and output a TypeScript component never reaches.

## Components

### component-reaches-no-io-global → presentational-component-performs-no-io · MUST

No file in a `components/` folder calls `fetch`, or any other input or output the runtime offers every module without an import.

| Why | Tags |
|---|---|
| such a global reaches a component without an import, so nothing at the top of its file shows the effect, and a component that fetches can no longer be shown or tested with plain data. | [] |
