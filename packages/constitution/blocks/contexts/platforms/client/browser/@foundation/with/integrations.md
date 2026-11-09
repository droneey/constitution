# Integrations

> Governs how a tab left open across releases keeps up with the server it calls.

## Releases

### outdated-tab-updates-by-a-release-reload → device-program-below-the-oldest-supported-release-updates-first · MUST

Every tab below the oldest release its server supports loads the current release itself, by a release reload.

#### Why

A reload forced on its user mid-task interrupts them and one that drops what they typed costs them their work, so it waits for the next navigation or their consent and carries their unsent input across.

#### Examples

```ts title="Avoid"
if (response.status === HttpStatus.UpgradeRequired) {
  location.reload(); // drops what was typed
}
```

```ts title="Prefer"
if (response.status === HttpStatus.UpgradeRequired) {
  showBanner({
    message: "A new version of the shop is ready.",
    action: { label: "Reload", run: reloadKeepingDrafts },
  });
}
```
