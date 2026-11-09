# Deployment

> Governs how the settings model takes the settings its host hands the program.

## General

### settings-model-sets-an-env-prefix → configuration-enters-only-through-its-declaration · MUST

Every `BaseSettings` sets an `env_prefix`.

#### Why

Without a prefix the settings model reads a variable of the same name that another tool in the process's environment sets, so a setting nobody declared for the program enters it.

#### Examples

```py title="Avoid"
class Settings(BaseSettings):
    model_config = SettingsConfigDict(frozen=True)

    database_url: PostgresDsn
```

```py title="Prefer"
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="SHOP_", frozen=True)

    database_url: PostgresDsn
```

### settings-model-keeps-extra-forbidden → configuration-enters-only-through-its-declaration · MUST

No `BaseSettings` loosens its default `extra='forbid'`.

#### Why

With `extra` loosened, a key the settings model does not declare in a dotenv file it reads, a misspelt one among them, is dropped in silence or kept unread instead of failing the start.

#### Examples

```py title="Avoid"
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="SHOP_", extra="ignore", frozen=True)

    database_url: PostgresDsn
```

```py title="Prefer"
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="SHOP_", frozen=True)

    database_url: PostgresDsn
```
