```yaml
# the standing grant of the nightly triage run, kept with the project
task: label and answer the issues opened since the last run
identity: triage-bot      # a token that reaches issues and nothing else
may:
  - read the repository
  - add a label to an issue
  - comment on an issue
bounds:
  comments: at most 1 per issue
  issues: at most 50 per run
otherwise: wait for a person   # a push, a merge, a release, a close
```
