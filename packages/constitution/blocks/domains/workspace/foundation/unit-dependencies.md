# Unit dependencies

> Governs the dependencies of units and the imports between them.

## Dependencies

### dependency-has-one-version-across-units · MUST

A dependency has one version, or one range, across every manifest of the repository, which the lockfile resolves once — save the peer range a distributed unit declares for a dependency its consumer owns.

| Why | Tags |
|---|---|
| two versions of one dependency behave differently in two units, and the difference is found in production. | [] |

### unit-declares-what-it-imports · MUST

A unit declares in its own manifest every dependency it imports, and never relies on one the root or another unit declares.

| Why | Tags |
|---|---|
| an undeclared import works only while another declaration happens to exist, and breaks the unit when it is installed alone or that declaration goes. | [] |

## Imports

### unit-reached-only-through-its-entries → dependency-reached-through-its-public-entry · MUST

A unit, or a script of the root, reaches another unit only by its name, through its entries, never by a path into its folder.

| Why | Tags |
|---|---|
| a path inside a unit is not part of its contract, and an import by path proves an entry no consumer can reach. | [] |

### units-form-no-dependency-cycle → module-imports-form-no-cycle · MUST

The units of a workspace form no cycle, neither in the dependencies their manifests declare nor in their imports.

| Why | Tags |
|---|---|
| units in a cycle cannot be built, released or versioned apart, so they are one unit in disguise. | [] |

## Requirements for implementation

### workspace-tool-links-units-from-the-working-tree · SHOULD

The tool that manages a workspace resolves the repository's own units from the working tree, never from the registry.

| Why | Tags |
|---|---|
| a change to a unit is then tested by every unit that uses it before it is published. | [testing] |
