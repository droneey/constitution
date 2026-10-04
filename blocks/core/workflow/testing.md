# Testing

## Practices

## tests-first-from-a-description · SHOULD
When a behaviour is described before it is built — in an issue or a plan — an agent writes its tests from the description first. A person may write the code first.

| Why | Check | Tags |
|---|---|---|
| tests written from the description prove what was asked, not what was built. | review | [testing] |

## bug-fix-starts-with-failing-test → test-seen-failing
A bug fix begins with the test that reproduces the bug, seen failing before the fix.

| Why | Check | Tags |
|---|---|---|
| the test proves the fix fixes this bug, and keeps it from coming back. | review | [testing] |

## Scheduled runs

## whole-program-mutated-periodically · SHOULD
The whole program is mutated on a schedule and before each release; a survivor opens an issue.

| Why | Check | Tags |
|---|---|---|
| the check mutates only what a change touches, so a case weakened or deleted leaves survivors in code no change has touched since. | review | [testing] |
