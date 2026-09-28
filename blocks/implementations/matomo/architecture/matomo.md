# Matomo

## matomo-only-in-its-sink · MUST
Only the Matomo sink knows Matomo — its data layer, and the container's address taken from configuration. It seeds the data layer before the container script, which loads asynchronously.
**Why:** the service is replaced or removed as one file, and nothing else in the program knows it exists.
**Check:** tool — architecture
**Tags:** architecture
**Implements:** `sinks-behind-one-contract`
