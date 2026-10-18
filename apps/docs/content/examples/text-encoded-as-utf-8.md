```pseudo title="Avoid"
let invoices = readFile("invoices.csv")
writeFile("report.txt", report)
```

```pseudo title="Prefer"
let invoices = readFile("invoices.csv",
  "utf-8")
writeFile("report.txt", report,
  "utf-8")
```
