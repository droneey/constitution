# Licences

> Governs the check of the dependencies' licences against the project's allowlist, and its exceptions.

## General

### lockfile-licences-checked-against-the-allowlist → dependency-licence-on-the-allowlist · MUST

Every dependency a lockfile names has its licence checked by OSV-Scanner against the project's allowlist. A licence off it is a finding.

#### Why

A licence nobody checks enters with the update that brings it in, and the project learns of the obligation only once what it shipped is bound by it.

#### Examples

```bash title="Avoid"
osv-scanner scan source --all-vulns --recursive .
```

```bash title="Prefer"
osv-scanner scan source --all-vulns --recursive --licenses="MIT,Apache-2.0,BSD-2-Clause,BSD-3-Clause,ISC" .
```

## Exceptions

### licence-exception-held-as-a-package-override → suppression-silences-one-finding · MUST

Every licence exception is a `[[PackageOverrides]]` entry that names its one package, never one that matches several.

#### Why

An entry that matches several packages silences the licence of each, the next one an update brings in among them, and no reader can tell which of them it was meant for.

#### Examples

```toml title="Avoid"
[[PackageOverrides]]
ecosystem = "npm"
license.override = ["MIT"]
```

```toml title="Prefer"
[[PackageOverrides]]
name = "spdx-exceptions"
ecosystem = "npm"
license.override = ["CC-BY-3.0"]
```

### license-override-corrects-only-wrong-licence-data → dependency-licence-on-the-allowlist · MUST

Every `license.override` names the licence its package really has, never one the allowlist holds and the package lacks. It corrects a licence the scan's licence data, deps.dev's by default, names wrongly.

#### Why

An override corrects the data, and used to let a licence through it hides an obligation the project took on.

#### Examples

```toml title="Avoid"
[[PackageOverrides]]
name = "sharp"
ecosystem = "npm"
license.override = ["MIT"]
```

```toml title="Prefer"
[[PackageOverrides]]
name = "sharp"
ecosystem = "npm"
license.override = ["Apache-2.0"]
```

### build-only-tool-exempted-by-license-ignore → dependency-licence-on-the-allowlist · MUST

Every tool exempted from the allowlist is exempted by `license.ignore = true` in its entry, never by an override of its licence. Such a tool only builds, tests or checks the program.

#### Why

An override of the licence of a tool that never ships cannot be told from one that lets a licence through, while `license.ignore` skips only the licence, so the tool's vulnerabilities are still checked.

#### Examples

```toml title="Avoid"
[[PackageOverrides]]
name = "caniuse-lite"
ecosystem = "npm"
license.override = ["MIT"]
```

```toml title="Prefer"
[[PackageOverrides]]
name = "caniuse-lite"
ecosystem = "npm"
license.ignore = true
```
