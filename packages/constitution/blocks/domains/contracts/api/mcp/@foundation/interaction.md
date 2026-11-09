# Interaction

> Governs what a tool server asks of the person through the client.

## Elicitation

### secret-never-asked-through-a-form · MUST

Every secret a tool server needs from its user is asked on a page of its own, never through the client. It sends the user there by a URL elicitation where the client supports one, and otherwise by a link, and no form the client shows, nor any tool's answer, asks for it. Such secrets include a password, a key, a token and a payment credential.

#### Why

What a form or a reply to a tool collects passes through the client and the language model's context, where logs and other servers read it, while a page of the server's own takes it straight from the user.

#### Examples

```text title="Avoid"
{
  "method": "elicitation/create",
  "params": {
    "mode": "form",
    "message": "Enter your shop's API key.",
    "requestedSchema": {
      "type": "object",
      "properties": { "apiKey": { "type": "string" } },
      "required": ["apiKey"]
    }
  }
}
```

```text title="Prefer"
{
  "method": "elicitation/create",
  "params": {
    "mode": "url",
    "url": "https://mcp.shop.example.com/connect/api-key",
    "message": "Connect your shop's API key on our site to continue."
  }
}
```
