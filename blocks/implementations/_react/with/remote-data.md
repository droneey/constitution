# React with remote data

> The binding unit in React.

## binding-unit-is-a-hook · SHOULD
An operation's binding unit is a hook in `<op>.hooks.ts`: it takes its adapter from the providers' context and calls the use-case, or the port when there is none. A plain `<op>.ts` exists only for a caller outside React — a loader, a guard — and not before one exists.
**Why:** a hook is the framework's reactive unit; the adapter comes from the composition root, so a spec hands it another.
**Check:** review
**Tags:** architecture
**Implements:** `binding-unit-composes-its-operation`
