# Root

> Governs where the tab reads its configuration.

## Wiring

### served-configuration-read-at-boot → root-alone-reads-the-environment · MUST

In the tab, the configuration provider reads the configuration served beside the bundle as the program's environment, once, before the program starts.

| Why | Tags |
|---|---|
| the program then depends on one typed configuration, and a missing or malformed setting stops the start in every environment alike. | [] |
