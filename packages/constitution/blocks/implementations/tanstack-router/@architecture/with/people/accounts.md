# Accounts

> Governs routes guarded before they load.

## General

### guards-in-before-load → screen-guarded-through-the-session-owners-surface · MUST

Every route's access control is applied in its `beforeLoad`. It hands the binding unit that decides access the use case that unit calls, taken from the router's context, never through a hook or a component, and denies by throwing `redirect`.

#### Why

`beforeLoad` runs before the screen loads anything, so a denied user sees nothing of it, and before any component renders, so a guard that needs a hook or a component's context has nothing to read.

#### Examples

```tsx title="Avoid"
const AccountRoute = (): ReactElement => {
  const session = useSession();

  if (!session.isSignedIn) {
    return <Navigate to="/sign-in" />;
  }

  return <Outlet />;
};
```

```tsx title="Prefer"
export const Route = createFileRoute('/_account')({
  beforeLoad: async ({ context, location }) => {
    if (!(await canEnterAccount(context.useCases.getSession))) {
      throw redirect({ to: '/sign-in', search: { returnTo: location.href } });
    }
  },
  component: AccountLayout,
});
```
