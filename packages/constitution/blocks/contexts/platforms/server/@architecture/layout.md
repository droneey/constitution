# Layout

> Governs a server's tree: where its probes and its stop path live.

## Homes

### server-lifecycle-code-knows-no-product → shared-piece-placed-by-meaning · SHOULD

No probe or stop path of a server knows anything of the product. Each lives in `libs/` or comes with the server's framework as helpers the program calls, and no feature or delivery unit of the product holds one.

| Why |
|---|
| a probe or a stop path written into the product is written and proven again in every server, and the feature or delivery unit that holds it must reach every part the root alone knows. |
