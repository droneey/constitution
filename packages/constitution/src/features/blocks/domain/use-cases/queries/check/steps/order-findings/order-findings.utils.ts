import type { Finding } from '#/kernel/types';
import { compareText } from '#/kernel/utils';

// By the code before the message, so a reworded message keeps its place.
const compareFindings = (left: Finding, right: Finding): -1 | 0 | 1 =>
  compareText(left.path, right.path) ||
  compareText(left.code, right.code) ||
  compareText(left.message, right.message);

const orderFindings = (findings: readonly Finding[]): readonly Finding[] =>
  findings.toSorted(compareFindings);

export { orderFindings };
