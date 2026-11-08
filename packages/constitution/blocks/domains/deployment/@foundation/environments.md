# Environments

> Governs what a program's code branches on in its deployment environments.

## General

### behaviour-never-keyed-on-the-environments-name · SHOULD

The program's code branches on a setting named for what it changes, never on its deployment environment's name. Such settings include a log level, an address and an outside service's test mode, and the branches they key include the program's choice of an implementation.

| Why |
|---|
| a branch on the name runs code in one deployment environment that no other runs, so what one deployment environment proves says nothing of the next, while a named setting can be turned on wherever it is needed — the twelve-factor app. |
