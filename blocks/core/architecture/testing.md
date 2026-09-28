# Testing

## The sandbox

## effects-faked-through-ports · SHOULD
Network, time, randomness, processes and credentials are faked through their ports, with one fake per port, named `<port>.fake`.
**Why:** a fake behind the same port as the real effect replaces it without touching the code under test.
**Check:** review
**Tags:** testing

## Files and names

## test-code-unreachable-from-production · MUST
Production code never imports a file of `__tests__/` or of `tests/`.
**Why:** a fake or a fixture in production code ships test behaviour to users.
**Check:** tool — architecture
**Tags:** testing, architecture
