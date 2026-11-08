# Breaches

> Governs a breach of personal data: its record and who is told of it.

## Vocabulary

A **personal data breach** is a breach of security that destroys, loses, alters, discloses or gives access to personal data without authority.

## General

### personal-data-breach-recorded · MUST

Every personal data breach is recorded with its effects and its remedy.

#### Why

A breach left unrecorded cannot be shown to the authority the law names, which asks to see every breach, and its remedy cannot be checked.

#### Examples

```text title="Avoid"
2026-10-14  backup store made public by mistake;
            closed
```

```text title="Prefer"
breach 2026-10-14
  when      2026-10-14 09:10 to 11:40
  what      backup of addresses public
  effects   3,120 customers' addresses
            readable; 2 downloads logged
  remedy    store closed, access test added,
            customers told
```

### personal-data-breach-notified-in-time · MUST

Every personal data breach is notified to the authority the law that binds the product names, within the time that law sets. Exempt: a breach that law does not ask to be notified, such as one unlikely to put people at risk.

#### Why

The deadline runs from when the breach is known, 72 hours under the GDPR's Article 33, and a late notice is a breach of its own.

#### Examples

```text title="Avoid"
law's limit   72 h from being known
Mon 09:00     breach known
Fri 16:00     authority notified
```

```text title="Prefer"
law's limit   72 h from being known
Mon 09:00     breach known
Tue 15:00     authority notified, the
              rest to follow
```

### persons-at-high-risk-told-of-a-breach · MUST

Every person a personal data breach puts at high risk is told of it without undue delay.

#### Why

Persons told late cannot protect themselves in time.

#### Examples

```text title="Avoid"
Mon 09:00   password hashes leaked
Mon 14:00   authority notified
Mar 30      blog post
```

```text title="Prefer"
Mon 09:00   password hashes leaked
Mon 14:00   authority notified
Mon 16:00   each affected customer mailed:
            what leaked, reset your password,
            where else you used it
```
