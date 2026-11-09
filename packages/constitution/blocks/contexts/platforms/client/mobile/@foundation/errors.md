# Errors

> Governs the failures of an app on a phone or tablet: its crash rate.

## Crashes

### crash-rate-within-budget · SHOULD

Every app's crash rate stays below the project's crash budget, and below its app store's threshold where it sets a stricter one.

#### Why

A crash throws away what its user was doing, and an app store that publishes such thresholds shows an app that crosses them to fewer people, while each crash stays a defect the error rules hold.

#### Examples

```yaml title="Avoid"
# budgets/app-vitals.yaml
userPerceivedCrashRatePercent: 2.0   # above Google Play's 1.09% threshold
```

```yaml title="Prefer"
# budgets/app-vitals.yaml
userPerceivedCrashRatePercent: 0.5
googlePlayCrashThresholdPercent: 1.09
```
