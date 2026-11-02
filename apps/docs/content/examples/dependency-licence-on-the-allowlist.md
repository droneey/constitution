```text title="Avoid"
$ licences
chart-kit 4.0.0  AGPL-3.0
date-kit  2.3.1  MIT
no allowlist; nothing refused
```

```text title="Prefer"
allowlist: MIT, Apache-2.0,
  BSD-3-Clause, ISC
$ licences
chart-kit 4.0.0  AGPL-3.0
  not on the allowlist: refused
date-kit  2.3.1  MIT
```
