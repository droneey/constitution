# Root

> Governs the wiring of the server's lifecycle.

## Wiring

### server-lifecycle-wired-by-the-root → composition-root-wires-everything · MUST

The composition root runs a server's lifecycle: it opens the listeners and the consumers only once every part they use is built, and at the stop closes them first and the parts they used after, in the reverse order it built them.

| Why | Tags |
|---|---|
| work taken before its parts are ready fails, and a part closed under work still running turns a clean stop into failures. | [errors] |
