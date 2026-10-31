# Convergence

> Governs what a convergence program's flags may choose.

## General

### flag-never-changes-the-declared-state → run-reads-one-config-file · MUST

A flag of a convergence program chooses how the run goes — a stage, a target, the output — never what the declared state is.

| Why |
|---|
| a state a flag can change is no longer the one the config file declares, reviews and keeps. |
