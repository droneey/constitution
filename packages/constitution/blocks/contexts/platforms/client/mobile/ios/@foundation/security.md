# Security

> Governs where an iOS app stores its credentials.

## What it holds

### credential-kept-in-a-device-only-keychain-item → credential-stored-only-in-the-protected-store · MUST

Every credential, token or key an iOS app stores is a keychain item of an accessibility class that never leaves the device. Such a class is one whose name ends in `ThisDeviceOnly`, which no backup carries to another device.

#### Why

A keychain item of a class that migrates travels in the device's backup and is restored on a device its user may not control.

#### Examples

```swift title="Avoid"
func storeRefreshToken(_ token: Data) throws {
    let item: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrService as String: "example.shop.session",
        kSecAttrAccount as String: "refresh-token",
        kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock,   // travels in the backup to another device
        kSecValueData as String: token,
    ]
    let status = SecItemAdd(item as CFDictionary, nil)

    guard status == errSecSuccess else { throw KeychainError(status: status) }
}
```

```swift title="Prefer"
func storeRefreshToken(_ token: Data) throws {
    let item: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrService as String: "example.shop.session",
        kSecAttrAccount as String: "refresh-token",
        kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
        kSecValueData as String: token,
    ]
    let status = SecItemAdd(item as CFDictionary, nil)

    guard status == errSecSuccess else { throw KeychainError(status: status) }
}
```
