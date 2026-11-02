# Decorators

> Governs decorators.

## General

### decorator-is-a-standard-decorator · SHOULD

A decorator takes the form of the TC39 decorators proposal, which TypeScript implements without `experimentalDecorators`. The legacy form behind `experimentalDecorators` appears only where a framework's block requires it.

| Why |
|---|
| the legacy form receives other arguments and runs at another time than the standard one, so a decorator written for one misbehaves under the other, and the legacy form follows an earlier draft the committee replaced — the TC39 decorators proposal. |
