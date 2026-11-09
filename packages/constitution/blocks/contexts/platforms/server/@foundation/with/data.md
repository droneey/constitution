# Data

> Governs the connections a server's instances open to a store it owns.

## General

### store-connections-bounded-across-instances · MUST

All the connections a server's instances may open to a store it owns stay below what the store accepts. They count its pool's size times the most instances its host runs, a release's overlap included, with its one-off processes beside them.

#### Why

A host that adds instances under load multiplies every pool, and the store refuses the connection that crosses its limit on whichever instance asks.

#### Examples

```yaml title="Avoid"
# deploy/orders.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  maxReplicas: 20
---
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
        - name: orders
          env:
            - name: DATABASE_POOL_SIZE
              value: "20"   # 20 instances of 20 pass the store's 200 connections
```

```yaml title="Prefer"
# deploy/orders.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  maxReplicas: 12
---
apiVersion: apps/v1
kind: Deployment
spec:
  strategy:
    rollingUpdate:
      maxSurge: 3
  template:
    spec:
      containers:
        - name: orders
          env:
            # Why: 15 instances (12 and a surge of 3) of 10, and 20 for one-off processes, stay below the store's 200.
            - name: DATABASE_POOL_SIZE
              value: "10"
```
