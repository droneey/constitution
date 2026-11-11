# Tools

> Governs the tools that hold the rules in Python, and their findings: how a finding is suppressed.

## Findings

### suppression-reason-in-a-second-comment → suppression-states-its-reason · MUST

Where its tool stops reading at a second `#`, every suppression comment gives its reason in a second comment after its codes. The second comment opens with `#`, as in `# type: ignore[attr-defined]  # <reason>`.

#### Why

A tool that reads its codes to the end of the comment refuses other text after them, as a common type checker refuses `# type: ignore[code] -- reason` as invalid, while the type checkers and linters in common use stop reading at a second `#`, so the reason stands where every reader of the line sees it.

#### Examples

```py title="Avoid"
import vat_tables  # type: ignore[import-untyped] -- the wheel ships no py.typed
```

```py title="Prefer"
import vat_tables  # type: ignore[import-untyped]  # the wheel ships no py.typed
```
