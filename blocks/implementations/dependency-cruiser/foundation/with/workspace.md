# dependency-cruiser with workspace

> The run that holds the imports between the units of a workspace.

## units-cruised-from-the-root → unit-checked-by-its-own-parts
In a workspace, a run from the root over `packages shared libs` extends the foundation parts and the `workspace.mjs` part of each axis the project follows, which hold the imports between units, and each unit keeps its own run over its `src` with the parts of its blocks. The parts count a unit's folder as the unit whatever it holds, so the imports between the members inside one unit are the unit's own.

| Why | Check | Tags |
|---|---|---|
| an import between units crosses the folders of two of them, which no unit's own run reads, while the layers inside a unit are its own run's. | review | [] |
