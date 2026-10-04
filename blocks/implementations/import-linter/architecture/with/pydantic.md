# import-linter with pydantic

## pydantic-kept-out-of-the-domain → pydantic-only-at-the-edge
A contract of the template's pydantic section forbids `pydantic` and `pydantic_settings` to `kernel/`, `contracts/` and a feature's `domain/`, each importing them itself.

| Why | Check | Tags |
|---|---|---|
| a wildcard names the inner layers in any package, while the edge's folders are too many to list, so the contract refuses the library where it never belongs. | tool/imports | [] |
