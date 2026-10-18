```mermaid
flowchart LR
  entries[Entry files] --> root[Root]
  integrations[Integrations] --> composition[Composition]
  root --> composition
  composition --> app[Feature app]
  app --> domain[Feature domain]
  domain --> kernel[Kernel]
```
