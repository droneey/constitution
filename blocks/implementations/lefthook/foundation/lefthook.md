# Lefthook

## hook-rewrites-only-staged-files · MUST
A hook that formats rewrites only the staged files and stages them again; the check itself never writes.
**Why:** a hook that touches unstaged files mixes work in progress into the commit.
**Check:** review
**Tags:** process
**Implements:** `check-only-checks`
