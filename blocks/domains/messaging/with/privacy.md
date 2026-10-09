# Messaging with privacy

> Governs how long a broker keeps personal data.

## Retention

### broker-keeps-personal-data-no-longer-than-its-retention → personal-data-kept-no-longer-than-its-retention · MUST
A message that carries personal data is kept by the broker, its dead letters and its replays no longer than that data's retention, and an erasure reaches it there, unless the message carries only identifiers its consumer resolves.

| Why | Tags |
|---|---|
| a broker's log, a dead letter and a replay are copies of the data, and a copy no erasure reaches is data the person was told was gone. | [data] |
