# Document

> Governs who inserts a third-party script into the document.

## General

### third-party-script-loaded-by-what-needs-it → third-party-script-declared-where-it-is-used · MUST

A third-party script is declared by the component or the adapter that needs it. One a component uses is rendered as `<script async src>` by that component, and one a service behind a port needs is inserted by the adapter that implements the port alone.

| Why |
|---|
| a script declared elsewhere loads where nothing needs it, or before what it needs; React dedupes and orders the scripts it renders, which load with the component that needs them, and a service behind a port stays unknown to every component, so its adapter loads its script. |
