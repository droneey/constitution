# Presentation

> Governs where the catalogues and Lingui are imported in an interface.

## General

### lingui-only-where-text-is-rendered → layer-imports-dependencies-by-its-role · MUST

Lingui is imported only where text is rendered. Lingui and the message catalogues have their home in a presentation's screens, widgets and components, in a subcommand that words its own help, in an adapter whose port takes codes and values, and in `root/`, which provides the active locale; no use case, other binding unit, other adapter or primitive of `libs/` imports them.

| Why |
|---|
| copy worded in a use case or a library is fixed to one locale before the unit that shows or sends it can word it for its reader's, and a catalogue in the primitives puts one program's text into a library every program shares. |
