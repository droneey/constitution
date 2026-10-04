# Access control

## access-denied-unless-granted · MUST
Access is denied unless a rule grants it, and a test proves the access of each operation a caller outside the program can reach: a route, an endpoint, a command.

| Why | Check | Tags |
|---|---|---|
| access open by default is open wherever someone forgot a rule, and only a test notices the operation that forgot. | test | [security] |
