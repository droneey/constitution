# Stores

> Governs the state stores the interface's root builds.

## The vocabulary

A **state store** holds a part of the client's state in memory and tells what reads it when it changes; it keeps nothing beyond a run, as a store of the program's data does.

## General

### client-concerns-in-root-built-stores → composition-root-assembles-the-program · MUST

Each global concern the client owns lives in a state store of its own, which the root builds. Such a concern — the theme, the notices — is one every screen shares, and its state store holds that concern alone.

| Why |
|---|
| a state store built anywhere but the root is a second copy of a concern every screen shares, so two screens show two themes or two lists of notices, and a spec cannot hand in its own — a single source of truth. |
