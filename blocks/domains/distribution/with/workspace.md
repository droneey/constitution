# Distribution in a workspace

> Governs the root that uses its own configuration.

## Configuration

### root-dogfoods-its-configuration · SHOULD
The root of a workspace that distributes configuration installs it from the working tree and extends it as a consumer would.

| Why | Tags |
|---|---|
| configuration the repository does not use itself breaks first in a consumer's repository. | [testing] |
