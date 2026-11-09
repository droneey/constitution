# Changes

> Governs the working copy a change is handed back in.

## Hand-back

### working-copy-clean-at-hand-back · SHOULD

Every change is handed back with a clean working copy: no stray change and no scratch file outside the ignored folders.

#### Why

A stray file is committed by the next person who stages everything, or confuses whoever picks the work up.

#### Examples

```text title="Avoid"
Done: partial refunds, the check passes.

$ status
untracked  scratch-notes.txt
untracked  refunds/__tests__/refund.test.orig
modified   package manifest
```

```text title="Prefer"
Done: partial refunds, the check passes.

$ status
clean
```
