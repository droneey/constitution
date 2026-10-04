# Renovate

## update-cooldown-configured → dependency-release-cooldown
A minimum release age of some days holds back every update. Renovate proposes a fix for a known vulnerability at once, past that age, so the update it proposes carries the package manager's exemption for the package, with its advisory.

| Why | Check | Tags |
|---|---|---|
| most hijacked releases are found and pulled within days, and the package manager refuses the fix until its cooldown names the package as exempt. | review | [] |
