# Transports

> Governs the connections an iOS app opens: App Transport Security.

## Connections

### app-transport-security-never-weakened-by-an-exception → network-connection-encrypted · MUST

Every iOS app keeps the protection of App Transport Security's defaults. No exception it declares weakens that protection, such as one that allows plain traffic or an outdated protocol.

#### Why

An exception that weakens App Transport Security lets a connection fall back to plain traffic or an outdated protocol, which anyone on a network the phone joins reads and changes.

#### Examples

```xml title="Avoid"
<!-- Info.plist -->
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSExceptionDomains</key>
    <dict>
        <key>images.shop.example</key>
        <dict>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/> <!-- product images travel in plain text -->
        </dict>
    </dict>
</dict>
<key>ShopImagesBaseURL</key>
<string>http://images.shop.example</string>
```

```xml title="Prefer"
<!-- Info.plist -->
<key>ShopImagesBaseURL</key>
<string>https://images.shop.example</string>
```
