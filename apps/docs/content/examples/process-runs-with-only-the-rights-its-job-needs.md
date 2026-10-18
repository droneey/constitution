```yaml title="Avoid"
service: invoices
user: root
```

```yaml title="Prefer"
service: invoices
user: invoices
readOnly: [/srv/invoices/templates]
writable: [/var/invoices]
```
