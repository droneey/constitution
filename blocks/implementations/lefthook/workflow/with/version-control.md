# Lefthook with version control

> Governs what the hooks refuse in a commit message.

### commit-subject-never-a-placeholder → commit-subject-says-what-changed · MUST
The `commit-msg` hook rejects a placeholder subject: "update", "fix stuff", "wip", "changes", "misc".

| Why | Tags |
|---|---|
| a placeholder subject makes the history useless at exactly the commit someone needs to understand. | [] |
