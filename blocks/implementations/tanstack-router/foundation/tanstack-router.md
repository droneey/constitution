# TanStack Router

## layout-lives-in-route-file · SHOULD
A layout is a pathless `_name/route.tsx` that renders `<Outlet/>`, never an `index.tsx`.
**Why:** an `index.tsx` is a leaf route, and a layout placed there renders nothing below it.
**Check:** review
**Tags:** design

## error-component-per-route · SHOULD
Each route that loads data declares its error component; the root declares the not-found one.
**Why:** a failed loader then costs its route, with its own message, not the whole application.
**Check:** review
**Tags:** errors, ux

## guards-in-before-load · SHOULD
Access control of a route sits in its `beforeLoad`, and ends in `redirect`.
**Why:** the guard runs before the screen loads anything, so a denied user sees nothing of it.
**Check:** review
**Tags:** security
