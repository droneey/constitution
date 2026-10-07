# Analytics with privacy

> Governs what an analytics library keeps before consent.

## Requirements for implementation

### analytics-stores-nothing-until-consent · MUST
The analytics library stores nothing on the device and sends no identifier until consent is given, where the law subjects its measurement to consent, and measures anonymously where the law exempts it.

| Why | Tags |
|---|---|
| a library that stores or identifies before consent makes the measurement the law exempts need consent, and starts the rest too early. | [security, data] |
