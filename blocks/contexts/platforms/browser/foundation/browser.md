# Browser

## no-browser-globals-during-render · MUST
Code that can render on a server reads no browser global while it renders.

| Why | Check | Tags |
|---|---|---|
| on the server the global does not exist, and the render fails or differs from the one in the tab. | review | [errors] |

## runtime-configuration-served-beside-bundle · MUST
One bundle serves every environment: its configuration is served beside it, and no environment value is baked into the bundle.

| Why | Check | Tags |
|---|---|---|
| one tested bundle is promoted from staging to production unchanged, and nothing environment-specific is published inside it. | review | [security] |

## bundle-reads-no-build-environment → runtime-configuration-served-beside-bundle
Browser code never reads `process.env`.

| Why | Check | Tags |
|---|---|---|
| a bundler fills it in at build time, and bakes one environment's values into the bundle. | tool/types | [security] |

## bundle-size-budget · SHOULD
Each bundle has a size budget the check holds, the embeddable one first.

| Why | Check | Tags |
|---|---|---|
| size grows one dependency at a time, and only a budget notices the one that crosses the line. | test | [performance] |
