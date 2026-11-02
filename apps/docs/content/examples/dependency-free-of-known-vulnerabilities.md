```text title="Avoid"
$ audit
1 moderate, 2 low
left as they are: low, or only
in development
```

```text title="Prefer"
$ audit
1 moderate, accepted:
  GHSA-5j4c-8p2g-v4jx in glob
  10.3.0, development only
  why: the linter walks only our
    own files with it
  accepted by Ann Lee
  review by 2026-12-01
```
