```pseudo
# presentation/bindings/last-resort: the command line's one handler of last resort
function runCommandLine(args, runCommand)
  try
    call runCommand(args)

    return ExitCode.Success
  catch error
    if isExpectedFailure(error) then
      printFailure(error.code, error.details)

      return ExitCode.Failure

    let incidentId = reportDefect(error)

    printFailure("internal", { incidentId })

    return ExitCode.Defect

# root/run: assembles the program, decides nothing
function run(args)
  return runCommandLine(args, createRunCommand(adapters))

# main.ts: hands the process to the program
import run from "root"

process.exitCode = run(process.argv)
# no code below main calls exit
```
