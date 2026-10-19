# Server

> Governs what Start's server serves, where it serves the program.

### runtime-config-from-one-server-function → runtime-configuration-served-beside-bundle · MUST

One server function serves the public projection of the configuration parsed at start; the root route loads it once, before anything reads configuration.

| Why | Tags |
|---|---|
| one bundle then serves every environment, and a missing setting fails at start. | [] |
