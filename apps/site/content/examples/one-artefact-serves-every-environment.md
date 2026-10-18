```mermaid
flowchart LR
  build[Build once] --> artefact[shop 1.4.2]
  artefact --> staging[Staging]
  artefact --> production[Production]
  stagingSettings[Staging settings] --> staging
  productionSettings[Production settings] --> production
```
