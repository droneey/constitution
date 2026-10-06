# dependency-cruiser with workspace

> The configuration of each unit of a workspace.

## cruiser-configuration-per-unit → unit-checked-by-its-own-parts
In a workspace, each unit has a configuration of its own that extends the parts of its blocks, and the parts count a unit's folder as the unit whatever it holds, so the imports between the members inside one unit are the unit's own.

| Why | Check | Tags |
|---|---|---|
| the layers inside a unit are its own blocks' to hold, and a member with a manifest of its own is still part of the unit around it. | review | [] |
