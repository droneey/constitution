# Matomo

## matomo-only-in-its-sink · MUST
Only the Matomo sink knows Matomo — its data layer, and the container's address, taken from configuration.
**Why:** the service is replaced or removed as one file, and nothing else in the program knows it exists.
**Check:** tool — architecture
**Implements:** `sinks-behind-one-contract`
