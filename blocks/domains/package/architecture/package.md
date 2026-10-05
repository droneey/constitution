# Package

## Layout

## package-root-holds-only-the-workspace · SHOULD
The root of a repository of packages holds only the workspace and the scripts of the check.

| Why | Check | Tags |
|---|---|---|
| a root with no code of its own has nothing a package could import by accident, and nothing that leaks into a consumer. | review | [] |

## Entries and consumers

## package-knows-no-consumer → libs-import-no-application-code
A library ships configuration, primitives or tooling, never a product's business, and knows nothing of those who install it.

| Why | Check | Tags |
|---|---|---|
| a package that knows its consumer changes whenever the consumer does, and serves no one else. | tool/imports | [] |
