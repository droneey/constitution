# People

> Governs personal data on a phone or tablet: permissions, push payloads, app store declarations, data at rest and in backups, what a screen hides from captures, and account deletion.

## Processing

### permission-narrowed-to-its-purpose → personal-data-collected-only-for-its-purpose · MUST

Every permission the app declares or asks for that opens personal data is the narrowest that a capability it offers needs. It takes approximate location over precise, the photos the person picks over the whole library, and while in use over always.

#### Why

A permission wider than its capability needs, or one no capability needs, opens personal data the purpose never called for — data minimisation.

#### Examples

```xml title="Avoid"
<!-- app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" /> <!-- to show nearby stores and attach one receipt photo -->
```

```xml title="Prefer"
<!-- app/src/main/AndroidManifest.xml -->
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

### push-payload-carries-no-personal-data-in-clear → personal-data-reaches-only-a-listed-recipient · MUST

No push notification's payload carries personal data in clear. The app fetches the data, or decrypts it, on the device.

#### Why

A push passes through the platform's push service and may show on a locked screen, so personal data it carries in clear reaches a service the person never chose and whoever looks at the screen.

#### Examples

```json title="Avoid"
{
  "message": {
    "token": "fcm-device-token",
    "notification": {
      "title": "Lab result for Anna Kowalska",
      "body": "HbA1c: 7.2%"
    }
  }
}
```

```json title="Prefer"
{
  "message": {
    "token": "fcm-device-token",
    "data": { "labResultId": "lab_81f2" },
    "android": {
      "notification": { "title_loc_key": "lab_result_ready" }
    }
  }
}
```

### app-store-privacy-declarations-follow-the-inventory → privacy-notice-follows-the-inventory · MUST

Every privacy declaration the app makes to an app store follows the inventory and changes with it. It includes what every library the app ships collects.

#### Why

The app stores show these declarations to people before they install, and one that misses what a library collects misleads them.

#### Examples

```xml title="Avoid"
<!-- PrivacyInfo.xcprivacy -->
<key>NSPrivacyCollectedDataTypes</key>
<array>
    <dict>
        <key>NSPrivacyCollectedDataType</key>
        <string>NSPrivacyCollectedDataTypeEmailAddress</string>
        <key>NSPrivacyCollectedDataTypeLinked</key>
        <true/>
        <key>NSPrivacyCollectedDataTypeTracking</key>
        <false/>
        <key>NSPrivacyCollectedDataTypePurposes</key>
        <array>
            <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
        </array>
    </dict>
</array> <!-- misses the crash data the crash-reporting library collects -->
```

```xml title="Prefer"
<!-- PrivacyInfo.xcprivacy -->
<key>NSPrivacyCollectedDataTypes</key>
<array>
    <dict>
        <key>NSPrivacyCollectedDataType</key>
        <string>NSPrivacyCollectedDataTypeEmailAddress</string>
        <key>NSPrivacyCollectedDataTypeLinked</key>
        <true/>
        <key>NSPrivacyCollectedDataTypeTracking</key>
        <false/>
        <key>NSPrivacyCollectedDataTypePurposes</key>
        <array>
            <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
        </array>
    </dict>
    <dict>
        <key>NSPrivacyCollectedDataType</key>
        <string>NSPrivacyCollectedDataTypeCrashData</string>
        <key>NSPrivacyCollectedDataTypeLinked</key>
        <false/>
        <key>NSPrivacyCollectedDataTypeTracking</key>
        <false/>
        <key>NSPrivacyCollectedDataTypePurposes</key>
        <array>
            <string>NSPrivacyCollectedDataTypePurposeAppFunctionality</string>
        </array>
    </dict>
</array>
```

## Data at rest

### personal-data-at-rest-kept-in-the-protected-class · MUST

Every file of personal data the app keeps takes the strongest class of file protection the system offers. Exempt: a file that the app reads or writes while that class keeps it closed, such as by work in the background while the device is locked, which takes the strongest class that work allows.

#### Why

A device that is lost, backed up to another account or read by another app gives up whatever the app left outside the strongest protection.

#### Examples

```swift title="Avoid"
func saveWorkoutSamples(_ samples: Data, to url: URL) throws {
    try samples.write(to: url, options: .atomic)   // takes the default class, weaker than this work allows
}
```

```swift title="Prefer"
func saveWorkoutSamples(_ samples: Data, to url: URL) throws {
    // Why: samples arrive in the background while the device is locked, which the complete class refuses.
    try samples.write(to: url, options: [.atomic, .completeFileProtectionUnlessOpen])
}
```

### restorable-personal-data-left-out-of-device-backups · MUST

Every piece of personal data that a server of the project holds and can restore is left out of the device's backups.

#### Why

A backup restored to another device carries the person's data to a device and an account they may not hold, though the server could have given it back.

#### Examples

```swift title="Avoid"
func storeOrderHistory(_ history: Data, at url: URL) throws {
    try history.write(to: url, options: [.atomic, .completeFileProtection])   // restored to whatever device the backup reaches
}
```

```swift title="Prefer"
func storeOrderHistory(_ history: Data, at url: URL) throws {
    try history.write(to: url, options: [.atomic, .completeFileProtection])

    var storedURL = url
    var values = URLResourceValues()
    values.isExcludedFromBackup = true
    try storedURL.setResourceValues(values)
}
```

### device-only-personal-data-kept-in-its-backups · MUST

Every piece of personal data that lives only on the device stays in the device's backups. Exempt: a credential, a token or a key the app keeps only on the device; data encrypted by such a key, which no restore can read; and data kept out of a backup the system cannot encrypt on the device, such as one made on a device with no screen lock.

#### Why

Data that lives only on the device is lost with the device unless its backup keeps it.

#### Examples

```xml title="Avoid"
<!-- app/src/main/AndroidManifest.xml -->
<application
    android:allowBackup="false"
    android:label="@string/app_name"> <!-- the journal, kept only on the device, is lost with it -->
</application>
```

```xml title="Prefer"
<!-- app/src/main/AndroidManifest.xml -->
<application
    android:dataExtractionRules="@xml/data_extraction_rules"
    android:label="@string/app_name">
</application>

<!-- app/src/main/res/xml/data_extraction_rules.xml -->
<data-extraction-rules>
    <cloud-backup disableIfNoEncryptionCapabilities="true">
        <include domain="database" path="journal.db" />
    </cloud-backup>
</data-extraction-rules>
```

### personal-data-backed-up-only-encrypted-on-the-device · MUST

Every piece of personal data the app lets into the device's backups goes only into a backup encrypted on the device. Exempt: a system that lets no app require that encryption.

#### Why

A backup not encrypted on the device can be read wherever it is kept, such as in the cloud account it goes to, so it hands the data to whoever reads it there.

#### Examples

```xml title="Avoid"
<!-- app/src/main/res/xml/data_extraction_rules.xml -->
<data-extraction-rules>
    <cloud-backup> <!-- backed up in clear from a phone with no screen lock -->
        <include domain="database" path="notes.db" />
    </cloud-backup>
</data-extraction-rules>
```

```xml title="Prefer"
<!-- app/src/main/res/xml/data_extraction_rules.xml -->
<data-extraction-rules>
    <cloud-backup disableIfNoEncryptionCapabilities="true">
        <include domain="database" path="notes.db" />
    </cloud-backup>
</data-extraction-rules>
```

## Display

### sensitive-screen-hidden-from-captures · MUST

Every sensitive screen is hidden from captures. A screen is sensitive when it shows a secret or personal data its user would not show to whoever looks at the device, such as a balance or a health record; the app blocks screenshots and screen recordings of it where the system allows it, and covers it in the snapshot the app switcher keeps.

#### Why

Screenshots sync to the cloud and the app switcher shows the last screen to whoever holds the phone, so what was on it outlives the moment it was read.

#### Examples

```kotlin title="Avoid"
class StatementActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { StatementScreen() }   // the balance shows in screenshots and in recent apps
    }
}
```

```kotlin title="Prefer"
class StatementActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
        setContent { StatementScreen() }
    }
}
```

## Rights

### account-deletion-started-in-the-app → personal-data-erased-on-request · MUST

Wherever a person can create an account in the app, they can start its deletion inside the app.

#### Why

A person who has only the app cannot leave without hunting for a support address, and the app stores refuse an app that offers no way.

#### Examples

```swift title="Avoid"
Section("Account") {
    Text("To delete your account, write to support@shop.example.")   // no way to start it in the app
}
```

```swift title="Prefer"
Section("Account") {
    Button("Delete account", role: .destructive) { isConfirmingDeletion = true }
}
.confirmationDialog("Delete your account?", isPresented: $isConfirmingDeletion) {
    Button("Delete account", role: .destructive, action: onDeletionConfirmed)
}
```
