# User interface

> Governs where the catalogues and Lingui are imported in an interface.

## General

### lingui-only-where-text-is-rendered → layer-imports-dependencies-by-its-role · MUST

Lingui is imported only where text is rendered. Lingui and the message catalogues have their home in a presentation's screens, widgets and components, and in `root/`, which provides the active locale; no other folder imports them — no domain, no application, no binding unit, no adapter and no primitive of `libs/`.

| Why |
|---|
| text worded below the presentation is fixed to one locale before a screen can word it for its own, and a catalogue in the primitives puts one program's text into a library every program shares. |
