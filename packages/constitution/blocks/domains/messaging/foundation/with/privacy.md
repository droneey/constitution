# Privacy

> Governs the personal data a message carries and how long a broker keeps it.

## Content

### message-carries-only-needed-personal-data → personal-data-collected-only-for-its-purpose · MUST

A message carries no personal data its consumers do not need; they reach the rest by an identifier.

| Why |
|---|
| a broker keeps messages, their copies in dead letters and their replays beyond the reach of an erasure, and every subscriber reads them. |

## Retention

### broker-keeps-personal-data-no-longer-than-its-retention → personal-data-kept-no-longer-than-its-retention · MUST

A message that carries personal data is kept by the broker, its dead letters and its replays no longer than that data's retention, and an erasure reaches it there, unless the message carries only identifiers its consumer resolves.

| Why |
|---|
| a broker's log, a dead letter and a replay are copies of the data, and a copy no erasure reaches is data the person was told was gone. |
