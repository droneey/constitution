# Data

> Governs what a Python feature's surface leaves out of what the data block keeps to its adapters.

## Surfaces

### feature-init-leaves-out-the-rebuild → rebuild-from-storage-called-only-by-its-adapters · MUST

No feature's `__init__.py` offers its aggregates' rebuild from storage. It neither imports the rebuild nor lists it in its `__all__`, so only the feature's own adapters reach it, by its module.

| Why |
|---|
| Python cannot keep a function of a module private, so a rebuild its feature's surface offers lets any caller outside build an aggregate from data no transition checked. |
