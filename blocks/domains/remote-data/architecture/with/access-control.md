# Remote data with access control

> Data another system owns, which a caller reads and changes only while signed in.

## unauthorized-ends-the-session-through-its-owner → unauthorized-acted-on-once-by-the-cache
The cache's handler turns the unauthorized error into session state through the surface of the feature that owns sessions.

| Why | Check | Tags |
|---|---|---|
| a session that expires during any read or write then ends the same way, and nothing outside the feature that owns sessions touches its state. | review | [] |
