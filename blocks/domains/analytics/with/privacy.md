# Analytics with privacy

> Governs what an analytics library keeps before consent.

## Requirements for implementation

### analytics-stores-nothing-until-consent · MUST
The analytics library stores nothing on the device and sends no identifier until consent is given, and measures anonymously where the law exempts it from consent.

| Why | Tags |
|---|---|
| without it, the measurement the law exempts cannot run without consent, and the rest cannot wait for it. | [security, data] |
