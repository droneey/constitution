# Browser

## no-browser-globals-during-render · MUST
Code that can render on a server reads no browser global while it renders.
**Why:** on the server the global does not exist, and the render fails or differs from the one in the tab.
**Check:** review
**Tags:** errors

## bundle-size-budget · SHOULD
Each bundle has a size budget the check holds, the embeddable one first.
**Why:** size grows one dependency at a time, and only a budget notices the one that crosses the line.
**Check:** test
**Tags:** performance
