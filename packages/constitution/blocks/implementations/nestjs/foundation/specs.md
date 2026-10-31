# Specs

> Governs how a spec builds the Nest program it drives.

## General

### specs-through-the-testing-module → server-spec-runs-in-process · MUST

A spec builds the app from the root's module with `Test.createTestingModule`, binds each adapter's token to a fake with `overrideProvider`, and runs `init()` and `close()` inside the case.

| Why |
|---|
| the testing module wires the modules the program wires, with only what lies outside replaced, and `close()` runs the hooks that release what the case opened. |
