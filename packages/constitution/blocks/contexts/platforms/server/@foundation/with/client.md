# Client

> Governs what a server sends a device program: the configuration it serves it.

## What reaches the device program

### device-program-configuration-holds-only-public-keys → device-program-holds-nothing-hidden · MUST

Every configuration a server sends a device program holds only the keys a public schema of that configuration names.

| Why |
|---|
| a key the server's configuration gains later, a secret among them, would otherwise reach every device program without anyone choosing to send it. |
