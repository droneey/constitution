# Biome

> The architecture parts also narrow two foundation GritQL rules: the one against `null` to code outside adapters and wire models, and the one against empty names to code outside `src/libs/`. `noConsole` stays on everywhere: the logger adapter and the command-line delivery layer write through the process's streams, as the composition root hands them over.
