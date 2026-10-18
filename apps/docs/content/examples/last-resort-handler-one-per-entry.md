```pseudo
# cli/main.ts: the command line's one handler of last resort
function main(args)
  try
    call runCommand(args)
    exit(0)
  catch error
    if isExpectedFailure(error) then
      printFailure(error.code, error.details)
      exit(1)
    let incidentId = reportDefect(error)
    printFailure("internal", { incidentId })
    exit(70)
# no code below main calls exit
```
