# CSS

### module-stylesheet-surface → access-only-through-curated-surface
A module that ships styles offers them through a stylesheet surface, `index.css`, beside its script surface; the program's root imports it by path, and inside the module the stylesheet imports its parts.

| Why | Tags |
|---|---|
| a script surface cannot re-export a stylesheet, and a path past the module's surface couples to a file the module is free to move. | [] |
