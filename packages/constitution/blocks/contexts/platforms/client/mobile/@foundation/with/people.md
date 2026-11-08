# People

> Governs personal data on a phone or tablet: permissions, push payloads, app store declarations, data at rest and in backups, what a screen hides from captures, and account deletion.

## Processing

### permission-narrowed-to-its-purpose → personal-data-collected-only-for-its-purpose · MUST

Every permission the app declares or asks for that opens personal data is the narrowest that a capability it offers needs. It takes approximate location over precise, the photos the person picks over the whole library, and while in use over always.

| Why |
|---|
| a permission wider than its capability needs, or one no capability needs, opens personal data the purpose never called for — data minimisation. |

### push-payload-carries-no-personal-data-in-clear → personal-data-reaches-only-a-listed-recipient · MUST

No push notification's payload carries personal data in clear. The app fetches the data, or decrypts it, on the device.

| Why |
|---|
| a push passes through the platform's push service and may show on a locked screen, so personal data it carries in clear reaches a service the person never chose and whoever looks at the screen. |

### app-store-privacy-declarations-follow-the-inventory → privacy-notice-follows-the-inventory · MUST

Every privacy declaration the app makes to an app store follows the inventory and changes with it. It includes what every library the app ships collects.

| Why |
|---|
| the app stores show these declarations to people before they install, and one that misses what a library collects misleads them. |

## Data at rest

### personal-data-at-rest-kept-in-the-protected-class · MUST

Every file of personal data the app keeps takes the strongest class of file protection the system offers. Exempt: a file that the app reads or writes while that class keeps it closed, such as by work in the background while the device is locked, which takes the strongest class that work allows.

| Why |
|---|
| a device that is lost, backed up to another account or read by another app gives up whatever the app left outside the strongest protection. |

### restorable-personal-data-left-out-of-device-backups · MUST

Every piece of personal data that a server of the project holds and can restore is left out of the device's backups.

| Why |
|---|
| a backup restored to another device carries the person's data to a device and an account they may not hold, though the server could have given it back. |

### device-only-personal-data-kept-in-its-backups · MUST

Every piece of personal data that lives only on the device stays in the device's backups. Exempt: a credential, a token or a key the app keeps only on the device; data encrypted by such a key, which no restore can read; and data kept out of a backup the system cannot encrypt on the device, such as one made on a device with no screen lock.

| Why |
|---|
| data that lives only on the device is lost with the device unless its backup keeps it. |

### personal-data-backed-up-only-encrypted-on-the-device · MUST

Every piece of personal data the app lets into the device's backups goes only into a backup encrypted on the device. Exempt: a system that lets no app require that encryption.

| Why |
|---|
| a backup not encrypted on the device can be read wherever it is kept, such as in the cloud account it goes to, so it hands the data to whoever reads it there. |

## Display

### sensitive-screen-hidden-from-captures · MUST

Every sensitive screen is hidden from captures. A screen is sensitive when it shows a secret or personal data its user would not show to whoever looks at the device, such as a balance or a health record; the app blocks screenshots and screen recordings of it where the system allows it, and covers it in the snapshot the app switcher keeps.

| Why |
|---|
| screenshots sync to the cloud and the app switcher shows the last screen to whoever holds the phone, so what was on it outlives the moment it was read. |

## Rights

### account-deletion-started-in-the-app → personal-data-erased-on-request · MUST

Wherever a person can create an account in the app, they can start its deletion inside the app.

| Why |
|---|
| a person who has only the app cannot leave without hunting for a support address, and the app stores refuse an app that offers no way. |
