# Binding units

> Governs where a binding unit declares whether its operation needs a verified identity, and what the guard that authenticates reads.

## General

### binding-unit-declares-its-access · MUST

Every binding unit an outside caller reaches declares where it is defined whether its operation needs a verified identity. Such a unit is a route, an endpoint, a subcommand or a tool.

| Why |
|---|
| access declared away from its binding unit is not read when that unit is reviewed, so one that lost its access, or never had any, passes review unseen. |

### authenticating-guard-reads-only-the-declarations · MUST

Every guard that authenticates decides whether an operation needs a verified identity only from its binding unit's declaration. Exempt: a guard the calling framework runs where it fixes the place of registration, which `fixed-registration-holds-only-the-handoff` holds.

| Why |
|---|
| a guard that also reads a list of its own decides each operation's access in two places, so a unit reviewed as protected ships open where the list says otherwise. |
