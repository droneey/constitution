# Secrets

> Governs the config file's secrets and the secret references that stand for them.

## Vocabulary

A config file's **secret reference** is the name it writes in a secret's place. What a secret reference resolves to is part of the run's input, as the config file is, and no setting the program declares for itself.

## General

### config-file-secret-written-as-a-reference · MUST

Every secret in the config file is written as a secret reference, never as its value. The secret reference points to an environment variable, to a file its host mounts, or to a secret store the program reads.

#### Why

A secret written as its value leaks wherever the file goes (a commit, a message, a review) so the file can no longer be shared.

#### Examples

```text title="Avoid"
database:
  host: db.example.com
  password: <the password itself>
```

```text title="Prefer"
database:
  host: db.example.com
  password: { env: ORDERS_DATABASE_PASSWORD }
```

### config-file-reference-resolved-on-read · SHOULD

Every secret reference the config file makes is resolved when the file is read, never at its first use.

#### Why

A secret reference resolved at its first use fails mid-run after part of the work is done — fail fast.

#### Examples

```pseudo title="Avoid"
function readConfig(path)
  return exportConfigSchema.parse(readFile(path))

function exportOrders(config, context)
  call writeExport(config.target, context)
  let token = resolveSecret(config.upload.token)

  call upload(config.target, token, context)
```

```pseudo title="Prefer"
function readConfig(path)
  let config = exportConfigSchema.parse(readFile(path))

  return config with {
    upload: { token: resolveSecret(config.upload.token) },
  }

function exportOrders(config, context)
  call writeExport(config.target, context)
  call upload(config.target, config.upload.token, context)
```

### missing-references-all-named-in-the-failure → parse-failure-lists-every-problem · SHOULD

Every read of the config file that finds secret references missing fails naming every one of them, never the first alone.

#### Why

A failure that names one missing secret reference at a time takes a run per secret reference to fix.

#### Examples

```text title="Avoid"
$ deploy --config deploy.yaml
error: secret ORDERS_DATABASE_PASSWORD is not set
```

```text title="Prefer"
$ deploy --config deploy.yaml
error: 3 secret references are missing
  database.password    env ORDERS_DATABASE_PASSWORD
  upload.token         env UPLOAD_TOKEN
  smtp.password        file /run/secrets/smtp
```
