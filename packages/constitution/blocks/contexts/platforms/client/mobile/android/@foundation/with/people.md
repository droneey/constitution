# People

> Governs the personal data of an Android app: the storage of its files and the deletion of its accounts.

## Data at rest

### personal-data-kept-in-credential-encrypted-private-storage → personal-data-at-rest-kept-in-the-protected-class · MUST

Every file of personal data an Android app stores sits in its private, credential-encrypted storage, never in shared storage. Exempt: data that work before the device's first unlock reads or writes, which sits in the app's device-encrypted storage, and a file its user asks the app to save to a place they choose or to the shared media and downloads the system offers.

#### Why

Shared storage is read by other apps and by whoever connects the device, and device-encrypted storage opens before its user has unlocked the device once.

#### Examples

```kotlin title="Avoid"
fun saveLabReport(context: Context, report: LabReport) {
    File(context.getExternalFilesDir(null), "lab-report-${report.id}.json")   // read by whoever connects the device
        .writeText(report.toJson())
}
```

```kotlin title="Prefer"
fun saveLabReport(context: Context, report: LabReport) {
    File(context.filesDir, "lab-report-${report.id}.json")
        .writeText(report.toJson())
}
```

## Rights

### account-deletion-linked-from-the-google-play-listing → personal-data-erased-on-request · MUST

Wherever an app is listed on Google Play, every account it creates can be deleted from a web page its listing links.

#### Why

A person who no longer has the app, or the device it ran on, has no other way to leave, and Google Play refuses an app whose listing links no such page.

#### Examples

```text title="Avoid"
Google Play Console > App content > Data safety > Data deletion
  Delete account URL: (none)
  Note: "Users can delete their account in the app under Settings."
```

```text title="Prefer"
Google Play Console > App content > Data safety > Data deletion
  Delete account URL: https://shop.example/account/delete
  The page signs the person in and deletes their account, with no install needed.
```
