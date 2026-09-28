# Testing

## The sandbox

## effects-faked-through-ports · SHOULD
In a test, network, time, randomness, processes and credentials are faked through their ports.

| Why | Check | Tags |
|---|---|---|
| a fake behind the same port as the real effect replaces it without touching the code under test. | review | [testing] |

## Files and names

## test-code-unreachable-from-production · MUST
Production code never imports a file of `__tests__/` or of `tests/`.

| Why | Check | Tags |
|---|---|---|
| a fake or a fixture in production code ships test behaviour to users. | tool — architecture | [testing] |
