import { compareText } from '#/kernel/utils';

/** A finding of a check, as a report lists it: the file it is about and its code. */
interface ListedFinding {
  readonly code: string;
  readonly path: string;
}

interface ReportLinesInput<TFinding extends ListedFinding> {
  readonly findings: readonly TFinding[];
  readonly textOf: (finding: TFinding) => string;
}

/** Each finding as a line that closes with its code, as a linter's rule id does, by file and code. */
const reportLinesOf = <TFinding extends ListedFinding>(
  input: ReportLinesInput<TFinding>,
): readonly string[] =>
  input.findings
    .map((finding) => ({
      finding,
      text: input.textOf(finding),
    }))
    .toSorted(
      (left, right) =>
        compareText(left.finding.path, right.finding.path) ||
        compareText(left.finding.code, right.finding.code) ||
        compareText(left.text, right.text),
    )
    .map(({ finding, text }) => `${finding.path}: ${text} [${finding.code}]`);

export { reportLinesOf };
