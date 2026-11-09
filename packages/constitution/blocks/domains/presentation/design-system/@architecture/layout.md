# Layout

> Governs where the theme lives in the tree.

## Vocabulary

The **theme module** is the folder **`theme/`**{#theme-module} of `libs/ui`, the interface's generic library.

## Theme

### theme-module-lives-in-the-ui-library · MUST

Everything of the theme lives in the theme module. That is the token source, or the outputs generated from tokens a package supplies, the theme's constants and theme modes, and the code that applies them. The product's own values sit there as data, which that code reads without knowing the product.

#### Why

The code that applies a theme knows nothing of the product, so kept in the program's own code it is tied to the program, and a token kept outside the theme's one home is missed by the tool and the reviewer that look for every token there.

#### Examples

```text title="Avoid"
src/
├── presentation/theme/
│   ├── modes                light, dark and increased contrast
│   └── apply-theme          reads the product's brand
└── libs/ui/theme/
    └── theme.tokens.json
```

```text title="Prefer"
src/libs/ui/theme/
├── theme.tokens.json        the product's values, as data
├── generated/               the outputs built from it
├── modes                    light, dark and increased contrast
├── constants
└── apply-theme              reads the values, knows no product
```
