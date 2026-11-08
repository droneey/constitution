# Security

> Governs the secrets a run masks and the way a secret reaches it.

## Secrets

### secret-masked-in-the-output-of-started-programs → secret-kept-out-of-output · MUST

Every secret a run knows is masked in the output of every program it starts, before the run prints that output.

#### Why

Terminal output lands in automation's logs and on shared screens, and a program the run starts prints what it was given, so a secret it echoes is leaked to everyone who reads them.

#### Examples

```ts title="Avoid"
const apply = await processes.run("terraform", ["apply", "-input=false"], {
  env: { TF_VAR_database_password: secrets.databasePassword },
});

stderr.write(apply.output); // a module that echoes the password prints it
```

```ts title="Prefer"
const apply = await processes.run("terraform", ["apply", "-input=false"], {
  env: { TF_VAR_database_password: secrets.databasePassword },
});

stderr.write(masked(apply.output, [secrets.databasePassword]));
```

### run-secret-never-read-from-environment-variables → secret-never-passed-as-a-process-argument · MUST

No secret a run takes reaches it by environment variables. It reaches the run by a file only its user can read, by standard input or from the protected store. Exempt: a secret whose caller can use none of those ways.

#### Why

Environment variables reach every process the run starts and the crash reports it writes, where a file, standard input or the protected store reaches only the code that reads it.

#### Examples

```ts title="Avoid"
const apiToken = env.SHOP_API_TOKEN; // reaches every process the run starts
```

```ts title="Prefer"
const apiToken =
  values["token-stdin"] === true
    ? (await text(stdin)).trim()
    : await keychain.read({ service: "shop", account: "api-token" });
```
