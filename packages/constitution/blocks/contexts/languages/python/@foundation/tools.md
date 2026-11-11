# Tools

> Governs the tools that hold the rules in Python, and their findings: how a finding is suppressed.

## Findings

### suppression-reason-in-a-second-comment → suppression-states-its-reason · MUST

Every Python suppression gives its reason in a second comment after its codes, opened by the reason marker. The second comment opens with `#` and the marker, as in `# type: ignore[import-untyped]  # Why: <reason>`. Exempt: a suppression whose tool's block places its reason elsewhere, such as on the line above it.

#### Why

A tool that reads its codes to the end of the comment refuses other text after them, as a common type checker refuses `# type: ignore[code] -- reason` as invalid, while the tools that read a Python suppression on its line, its type checkers, its linters and its mutation tools, stop at a second `#`; a reason given in one form after every tool's codes is found by its reader and by the check the same way, where one written in each tool's own form is missed.

#### Examples

```py title="Avoid"
import vat_tables  # type: ignore[import-untyped] -- the wheel ships no py.typed

print(report)  # noqa: T201 the report is the command's output
```

```py title="Prefer"
import vat_tables  # type: ignore[import-untyped]  # Why: the wheel ships no py.typed

print(report)  # noqa: T201  # Why: the report is the command's output
```
