# Memory

> Governs what a model run keeps for later model runs: its source and whom it is read for.

## Vocabulary

A model run's **model memory** is what it writes for later model runs to read back.

## General

### memory-keeps-its-source · SHOULD

Every model memory written from outside input keeps the source it came from.

| Why |
|---|
| model memory written from a poisoned page steers every later model run that reads it, and one with no source can be neither traced to the page nor removed with it. |

### memory-scoped-to-its-person · MUST

Every model memory written from outside input is read back only by model runs for the person it was written for.

| Why |
|---|
| model memory one person's run wrote from a poisoned page steers every other person's runs that read it, unseen, and hands them what the first person's text held. |
