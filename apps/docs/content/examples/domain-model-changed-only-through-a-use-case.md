```mermaid
flowchart LR
  useCase[Use case of the feature] --> moves[cancel, ship]
  service[Domain service it calls] --> moves
  repository[Repository adapter] --> rebuild[restore]
  queries[Queries adapter] --> rebuild
  moves --> transitions[Order transitions]
  rebuild --> transitions
```
