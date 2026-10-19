# Root

> Governs the wiring file and the reading of the environment.

## Wiring

### wiring-file-is-root-wiring-py → composition-root-wires-everything · MUST

The composition root wires the program in `root/wiring.py`.

| Why | Tags |
|---|---|
| every concrete choice of a Python program is then found in one file of one name. | [] |

### environment-read-only-under-root → root-alone-reads-the-environment · MUST

`os.environ`, `os.getenv` and `os.putenv` are reached only under `root/`, in the entry files and in specs.

| Why | Tags |
|---|---|
| a read of the environment anywhere else is a dependency on the process that no signature shows and no spec can hand in. | [security] |
