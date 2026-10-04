# import-linter with structlog

## structlog-imported-only-by-the-root → code-logs-through-the-standard-logger
A contract of the template's structlog section forbids `structlog` to `kernel/`, `libs/`, `shared/`, `contracts/`, `adapters/`, `features/`, `composition/` and `entrypoints/`.

| Why | Check | Tags |
|---|---|---|
| a wildcard names these folders in any package; the delivery layer, which a block names, stays with the review. | tool/imports | [] |
