# Privacy

> Governs the personal data a message carries and how long a broker keeps it.

## Content

### message-carries-only-needed-personal-data → personal-data-collected-only-for-its-purpose · MUST

A message carries only the personal data its consumers need. They reach the rest by an identifier.

| Why |
|---|
| every subscriber, dead letter and replay holds a copy of what a message carries, so a field no consumer needs spreads the data to places that never needed it — data minimisation. |

## Retention

### broker-keeps-personal-data-no-longer-than-its-retention → personal-data-kept-no-longer-than-its-retention · MUST

A broker keeps personal data no longer than its retention, its dead letters and its replays included. An erasure reaches a message that carries personal data there; a message that carries only identifiers its consumer resolves carries none.

| Why |
|---|
| a broker's log, a dead letter and a replay are copies of the data, and a copy no erasure reaches is data the person was told was gone. |
