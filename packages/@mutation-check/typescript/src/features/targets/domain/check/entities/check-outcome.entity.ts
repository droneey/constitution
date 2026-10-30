type ToolExitCode = number;

enum CheckStatus {
  NothingChanged = 'nothing-changed',
  Ran = 'ran',
}

type CheckOutcome =
  | {
      readonly status: CheckStatus.NothingChanged;
    }
  | {
      readonly exitCode: ToolExitCode;
      readonly status: CheckStatus.Ran;
    };

export type { CheckOutcome, ToolExitCode };
export { CheckStatus };
