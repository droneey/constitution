# React Native

## long-lists-virtualised · SHOULD
A list that can grow renders through a virtualised list, never `map` inside a scroll view.
**Why:** a mapped list mounts every row at once, and a long one freezes the device.
**Check:** review
**Tags:** performance
