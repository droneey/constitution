# Text

> Governs where text is made from the codes the domain returns.

## General

### domain-returns-codes-not-text → domain-imports-only-itself-and-the-kernel · MUST

The domain and the application layers return codes and values, and the presentation turns them into text; no message library reaches the domain.

| Why | Tags |
|---|---|
| the domain stays free of any language, and one code is worded differently per screen and locale. | [] |
