# People

> Governs the personal data of an Android app: the storage of its files and the deletion of its accounts.

## Data at rest

### personal-data-kept-in-credential-encrypted-private-storage → personal-data-at-rest-kept-in-the-protected-class · MUST

Every file of personal data an Android app stores sits in its private, credential-encrypted storage, never in shared storage. Exempt: data that work before the device's first unlock reads or writes, which sits in the app's device-encrypted storage, and a file its user asks the app to save to a place they choose or to the shared media and downloads the system offers.

| Why |
|---|
| shared storage is read by other apps and by whoever connects the device, and device-encrypted storage opens before its user has unlocked the device once. |

## Rights

### account-deletion-linked-from-the-google-play-listing → personal-data-erased-on-request · MUST

Wherever an app is listed on Google Play, every account it creates can be deleted from a web page its listing links.

| Why |
|---|
| a person who no longer has the app, or the device it ran on, has no other way to leave, and Google Play refuses an app whose listing links no such page. |
