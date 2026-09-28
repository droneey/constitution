# TanStack Start

## hashed-assets-immutable-html-revalidated · SHOULD
Hashed assets are served as immutable; the HTML, the runtime configuration and the embed entries are revalidated.

| Why | Check | Tags |
|---|---|---|
| hashed files never change, so they are cached for good, while what points at them must be fresh. | review | [performance] |
