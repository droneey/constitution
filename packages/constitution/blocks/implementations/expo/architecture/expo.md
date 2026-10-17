# Expo

### expo-router-root-is-root-routes → delivery-unit-registered-by-the-root · MUST

Expo Router's root is `src/root/routes/`, set by the `root` option of its config plugin, so the routes are the root's registration and `app` keeps its meaning as a feature's layer.

| Why | Tags |
|---|---|
| the router's default `src/app/` would give one word two meanings in one tree, and routes outside `root/` would put the root's registration in a folder of its own. | [] |
