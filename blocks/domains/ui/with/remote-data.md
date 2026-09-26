# User interface with remote data

> Screens that show and change data another system owns: how an operation is bound to the screen, how the application is composed, and how optimistic writes stay correct.

## binding-unit-result-is-union-by-status · MUST
A binding unit that loads or writes returns a union keyed by `status`. The data exists only in the success state, and the error state carries a typed domain error; no default is invented — no empty list for "not loaded yet". The union has only the states its operation has, and every consumer handles every state.
**Why:** a bag of flags allows combinations no state has, and an invented default hides loading and failure behind something that looks like data.
**Check:** review
**Tags:** types, ux
**Implements:** `illegal-states-unrepresentable`

## providers-compose-the-ui-application · SHOULD
The providers are the application's composition root: they build the configuration, the transport and the cache client, build each adapter by its factory from the transport, and hand the adapters to the binding units. No adapter imports a provider or a shared instance.
**Why:** every concrete choice is made in one place, and a test hands the same binding unit a different transport or adapter without touching it.
**Check:** review
**Tags:** architecture
**Implements:** `one-explicit-composition-root`

## binding-unit-composes-its-operation · SHOULD
A binding unit binds one operation: it takes its adapter from the providers and calls the use-case, or the port when there is none. A plain function form of it is added only when a caller that is not reactive appears.
**Why:** each operation is bound once, and the screen never learns which adapter serves it.
**Check:** review
**Tags:** architecture

## configuration-provider-reads-environment · SHOULD
The configuration provider is the application's one reader of the environment, and parses it once, at boot.
**Why:** a missing setting fails at start, and no component reads the environment on its own.
**Check:** review
**Tags:** security, architecture
**Implements:** `environment-read-once-at-boot`

## command-invalidates-in-its-binding-unit · SHOULD
After a write, invalidation happens in the command's binding unit, through the feature's key factory.
**Why:** the one place that knows what a write changed is the one that says what to reload.
**Check:** review
**Tags:** data

## optimistic-writes-in-rollback-lifecycle · MUST
An optimistic write happens only in the mutation's lifecycle, which can roll it back, never in the request itself. Optimistic entities come from domain factories. Folding streamed data as it arrives is not optimism.
**Why:** an optimistic change without a rollback leaves the screen showing what the server refused.
**Check:** review
**Tags:** data
**Implements:** `entities-guarded-where-the-program-owns-them`

## optimistic-lifecycle-safe-under-concurrency · MUST
Under concurrent writes, reads in flight for the touched keys are cancelled before the snapshot; a failure rolls back only its own changes; invalidation waits until the last write settles; and an item whose identifier the server assigns renders from the pending variables under a stable key.
**Why:** a snapshot-and-restore recipe breaks as soon as two writes overlap: a late read overwrites the optimistic state, or one failure erases the other's success.
**Check:** test
**Tags:** data

## input-driven-requests-debounced · SHOULD
A request driven by typing is sent after a pause, or on the deferred value.
**Why:** a request per keystroke floods the server and shows results for words the user has not finished.
**Check:** review
**Tags:** performance, ux
**Implements:** `fast-source-updates-once-per-frame`

## unauthorized-handled-once-in-cache · SHOULD
The cache's global error handler, wired by the providers, turns an unauthorized failure into session state through the surface of the feature that owns sessions. Other failures reach the screen through the binding unit's error state.
**Why:** an expired session is handled once, the same way on every screen, and no screen handles it differently.
**Check:** review
**Tags:** errors, security
**Implements:** `one-error-handler-per-transport`

## ui-specs-replace-the-transport · SHOULD
A screen's spec and a binding unit's spec run inside their providers, with the transport replaced by captured responses. Fakes of use-cases serve only a screen that shows no remote data.
**Why:** the spec then runs the real binding units, adapters and mapping, and catches a response the mapping gets wrong, which a faked use-case never sees.
**Check:** test
**Tags:** testing
**Implements:** `tests-run-in-a-sandbox`
