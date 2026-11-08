# Shape

> Governs the config file's shape and how it is read.

## Vocabulary

The **config file** is a file its user writes and hands a run, by its path or where the program looks for it, to tell the program what to do, such as its options or a declaration of the state it is to reach. A file of settings that the program's host serves beside its code is no config file.

The **config schema** is the declaration in the program's code that it parses the config file by.

## General

### config-file-rejects-unknown-keys → own-shape-parsed-strictly · MUST

Every config file is parsed as a shape the program owns, though its user writes it. A key the program does not know fails the read.

#### Why

A misspelt key would otherwise be ignored in silence, and the config file would say something the program never reads.

#### Examples

```pseudo title="Avoid"
let deployConfigSchema = object {
  region: string,
  replicas: integer,
}

let config = deployConfigSchema.parse(file)
# "replcas: 3" passes, and replicas stays at its default
```

```pseudo title="Prefer"
let deployConfigSchema = closed {
  region: string,
  replicas: integer,
}

let config = deployConfigSchema.parse(file)
```

### config-file-variants-selected-by-a-discriminant → illegal-state-unrepresentable · MUST

Every section of the config file that takes several forms is a union selected by a discriminant field.

#### Why

A section whose forms share one bag of optional fields accepts mixes no form allows, and a wrong one fails mid-run, or never, instead of on read with the field named — make illegal states unrepresentable.

#### Examples

```pseudo title="Avoid"
let storageSchema = closed {
  bucket: optional string,
  region: optional string,
  path: optional string,
}
```

```pseudo title="Prefer"
let storageSchema = union by "kind" {
  closed { kind: "bucket", bucket: string, region: string },
  closed { kind: "disk", path: string },
}
```

### config-file-value-kind-has-one-syntax · SHOULD

Each kind of value in the config file, such as a size or a duration, is written in one syntax.

#### Why

Two syntaxes for one kind make a user guess which one a field takes, and let two parsers read one value two ways.

#### Examples

```text title="Avoid"
cache:
  maxSize: 512MB
  ttl: 3600
uploads:
  maxSize: 10485760
  timeout: 30s
```

```text title="Prefer"
cache:
  maxSize: 512MB
  ttl: 1h
uploads:
  maxSize: 10MB
  timeout: 30s
```

## Reading

### config-file-constraints-checked-on-read → outside-value-parsed-once-where-it-enters · MUST

Every constraint between fields of the config file is checked when the file is read. It is checked before the program acts on any of the file, never at the point of use.

#### Why

An impossible combination found mid-run fails after part of the work is done, far from the line that caused it — fail fast.

#### Examples

```pseudo title="Avoid"
let backupConfigSchema = closed {
  everyDays: integer,
  retentionDays: integer,
}

function runBackup(config, context)
  call copyDatabase(config, context)

  if config.retentionDays < config.everyDays then
    throw new RetentionShorterThanScheduleError()
```

```pseudo title="Prefer"
let backupConfigSchema = closed {
  everyDays: integer,
  retentionDays: integer,
} where retentionDays >= everyDays

function runBackup(config, context)
  call copyDatabase(config, context)
```
