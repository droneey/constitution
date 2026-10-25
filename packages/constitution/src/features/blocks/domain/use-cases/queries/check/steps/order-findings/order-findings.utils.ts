import type { Finding } from '#/kernel/types';
import { compareText } from '#/kernel/utils';

// By the file, then by the code; findings of one code in one file keep the order their check gave.
const compareFindings = (left: Finding, right: Finding): -1 | 0 | 1 =>
  compareText(left.path, right.path) || compareText(left.code, right.code);

const orderFindings = <TFinding extends Finding>(
  findings: readonly TFinding[],
): readonly TFinding[] => findings.toSorted(compareFindings);

export { orderFindings };
