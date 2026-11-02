# Root

> Governs how the composition root assembles the server's lifecycle.

## Assembly

### server-lifecycle-assembled-by-the-root → composition-root-assembles-the-program · MUST

The composition root opens a server's listeners and consumers last, and its stop closes them first. It opens the listeners and the consumers only once every part they use is built, and hands the stop path every part in the order it built them, which at the stop closes the listeners and the consumers first and the parts they used after, in the reverse order.

| Why |
|---|
| work taken before its parts are ready fails, and a part closed under work still running turns a clean stop into failures. |
