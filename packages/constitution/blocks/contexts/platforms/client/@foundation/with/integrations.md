# Integrations

> Governs how a device program whose release its user holds keeps up with the services it calls.

## Releases

### device-program-below-the-oldest-supported-release-updates-first · MUST

Every device program updates before its next call to a server that no longer supports its release. It loads the current release itself where its platform lets it, and otherwise stops and asks its user to update. Such device programs, whose release their user holds, include an installed app and a tab left open across releases.

#### Why

The user, not the maker, decides when a held release changes, so a fix for a flaw, or a change of the server's format, reaches every user only through a floor the server sets and the device program obeys.

#### Examples

```ts title="Avoid"
export const openOrders = async (context: Context): Promise<void> => {
  const orders = await ordersApi.listOrders(context); // called from a release the server dropped
  navigation.navigate(Screen.Orders, { orders });
};
```

```ts title="Prefer"
export const openOrders = async (context: Context): Promise<void> => {
  const support = await releasesApi.support(context);

  if (Release.isBelow(appRelease, support.oldestSupported)) {
    navigation.replace(Screen.UpdateRequired);
    return;
  }

  const orders = await ordersApi.listOrders(context);
  navigation.navigate(Screen.Orders, { orders });
};
```
