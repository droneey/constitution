```md
## Threats

POST /invoices/upload accepts a PDF from a signed-in customer.

- An oversized file: refused past 10 MB before it is read.
- A path in the file name: the file is stored under a generated id.
- Another customer's invoice: the owner is checked on every read.
- A PDF with scripts: it is served for download only, never inline.
```
