# Incidents

> Governs a security incident of a released program: the authority and the users told of it.

## Vocabulary

A **released program** is a program or a package the project releases for others to install and run, whether from a package registry, a store or a download, such as a distributed package, a mobile app or a desktop app.

A **security incident** is either a vulnerability actively exploited in a released program, or a severe event, severe by the measure of the law that binds the product, that harms the confidentiality, integrity or availability of a released program, its data or its users.

## General

### security-incident-reported-in-time · MUST

Every security incident is reported to the authority the law that binds the product names, within the time that law sets.

#### Why

The deadline runs from when the maker learns of it, and a late report is a breach of its own: the EU's Cyber Resilience Act, binding since 11 September 2026, asks for an early warning within 24 hours and a notification within 72, of a program from an app store as much as of a package from a registry.

#### Examples

```text title="Avoid"
Mon 10:00  told: 4.2 is exploited
Thu 16:00  4.2.1 released
Fri 09:00  blog post
```

```text title="Prefer"
Mon 10:00  told: 4.2 is exploited
Mon 18:00  early warning to the
           authority, within 24 h
Wed 09:00  notification to the
           authority, within 72 h
Wed 12:00  users told: update to
           4.2.1, or turn off sync
```

### users-told-of-a-security-incident · MUST

Every user a security incident reaches is told of it and of what to do.

#### Why

Users left unaware keep using what is compromised and cannot protect themselves, and the EU's Cyber Resilience Act obliges the maker to inform them.

#### Examples

```text title="Avoid"
Mon 10:00  told: 4.2 is exploited
Mon 18:00  early warning to the authority
Wed 09:00  notification to the authority
Wed 12:00  4.2.1 released, notes say
           "stability fixes"
```

```text title="Prefer"
Mon 10:00  told: 4.2 is exploited
Mon 18:00  early warning to the authority
Wed 09:00  notification to the authority
Wed 12:00  4.2.1 released; every 4.2 user
           told in the app and by mail:
           update to 4.2.1, or turn off sync
```
