```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Bash(printenv:*)",
      "Bash(cat .env:*)"
    ]
  }
}
```
