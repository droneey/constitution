# TanStack Router

## layout-lives-in-route-file · MUST
A layout is a pathless `_name/route.tsx` that renders `<Outlet/>`, never an `index.tsx`.
**Why:** an `index.tsx` is a leaf route, and a layout placed there renders nothing below it.
**Check:** review
**Tags:** architecture

## error-component-per-route · SHOULD
Each route that loads data declares its error component; the root declares the not-found one.
**Why:** a failed loader then costs its route, with its own message, not the whole application.
**Check:** review
**Tags:** errors, ux
**Implements:** `error-boundary-per-screen`
