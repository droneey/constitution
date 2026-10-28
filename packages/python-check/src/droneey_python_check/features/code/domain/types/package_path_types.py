from typing import NewType

# A folder or module inside an import package, by the names of its parts; () is the package itself.
PackagePath = NewType('PackagePath', tuple[str, ...])
