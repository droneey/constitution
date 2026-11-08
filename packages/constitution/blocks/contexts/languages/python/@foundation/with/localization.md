# Localization

> Governs the messages files of Python code.

## Vocabulary

A messages file's mark is **`_messages`**{#message-file}, joined to the module's name by an underscore.

## Messages files

### messages-file-is-a-messages-module → messages-file-carries-its-mark · MUST

Every messages file is a Python module, `<name>_messages.py`.

#### Why

The localization block's mark puts a dot in a module's name, which Python reads as a package boundary, so a messages file named its way cannot be imported, and one that is no module is read by no code of the program.

#### Examples

```text title="Avoid"
src/shop/presentation/screens/
├── __init__.py
├── checkout.py
└── checkout.messages.json    no module, and no name Python imports
```

```text title="Prefer"
src/shop/presentation/screens/
├── __init__.py
├── checkout.py
└── checkout_messages.py
```
