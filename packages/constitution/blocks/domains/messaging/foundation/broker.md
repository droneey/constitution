# Broker

> Governs the program's rights on the broker.

## Rights

### broker-rights-scoped-to-own-channels → credential-has-least-privilege · MUST

A program's credential for the broker writes only the channels it publishes to and reads only those it consumes.

| Why |
|---|
| a credential that reaches every channel lets one compromised program read every message and forge any other's — least privilege. |
