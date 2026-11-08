# Transports

> Governs the connections an Android app opens: its network security configuration.

## Connections

### cleartext-refused-by-the-network-security-configuration → network-connection-encrypted · MUST

Every Android app's network security configuration permits no cleartext traffic, for its base and for every domain it names. Exempt: a domain it names for a local connection alone, such as the loopback.

#### Why

A configuration that permits cleartext for any domain lets that traffic travel in plain text, which anyone on a network the phone joins reads and changes.

#### Examples

```xml title="Avoid"
<!-- app/src/main/res/xml/network_security_config.xml -->
<network-security-config>
    <base-config cleartextTrafficPermitted="false" />
    <domain-config cleartextTrafficPermitted="true"> <!-- product images travel in plain text -->
        <domain includeSubdomains="true">images.shop.example</domain>
    </domain-config>
</network-security-config>
```

```xml title="Prefer"
<!-- app/src/main/res/xml/network_security_config.xml -->
<network-security-config>
    <base-config cleartextTrafficPermitted="false" />
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="false">localhost</domain>
    </domain-config>
</network-security-config>
```
