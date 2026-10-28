import { LineRange } from '../../domain/value-objects';

const HUNK_HEADER_PATTERN = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm;
const IMPLIED_LINE_COUNT = '1';

const lineRangesOf = (sectionText: string): readonly LineRange[] =>
  [
    ...sectionText.matchAll(HUNK_HEADER_PATTERN),
  ].flatMap(([, firstLine, lineCount = IMPLIED_LINE_COUNT]) =>
    Number(lineCount) > 0
      ? [
          LineRange.create({
            endLine: Number(firstLine) + Number(lineCount) - 1,
            startLine: Number(firstLine),
          }),
        ]
      : [],
  );

export { lineRangesOf };
