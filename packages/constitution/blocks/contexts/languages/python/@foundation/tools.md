# Tools

> Governs the tools that hold the rules in Python, and their findings: how a finding is suppressed.

## Findings

### suppression-reason-in-a-second-comment → suppression-states-its-reason · MUST

Every comment that silences a tool's findings by their codes gives its reason in a second comment after them. The second comment opens with `#`, as in `# type: ignore[attr-defined]  # <reason>`.

| Why |
|---|
| a tool that reads its codes to the end of the comment refuses other text after them, as a common type checker refuses `# type: ignore[code] -- reason` as invalid, while the type checkers and linters in common use stop reading at a second `#`, so the reason stands where every reader of the line sees it. |
