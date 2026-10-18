```pseudo
# src/__tests__/network.fixtures, preloaded once for every unit spec
for each connect in [fetch, openSocket, connectDatabase]
  replace connect with function(target)
    throw new NetworkRefused("a unit spec reached " + target)

# an integration spec loads no such fixture: it reaches the engines
# it started on the loopback, inside the sandbox
```
