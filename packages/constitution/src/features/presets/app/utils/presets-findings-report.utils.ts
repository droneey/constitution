import { compareText } from '#/kernel/utils';

import type { PresetsFinding } from '../../domain/entities';
import { presetsFindingTextOf } from './presets-finding-texts.utils';

/** Each finding closes with its code, as a linter's rule id does. */
const findingLinesOf = (findings: readonly PresetsFinding[]): readonly string[] =>
  findings
    .map((finding) => ({
      finding,
      text: presetsFindingTextOf(finding),
    }))
    .toSorted(
      (left, right) =>
        compareText(left.finding.path, right.finding.path) ||
        compareText(left.finding.code, right.finding.code) ||
        compareText(left.text, right.text),
    )
    .map(({ finding, text }) => `${finding.path}: ${text} [${finding.code}]`);

export { findingLinesOf };
