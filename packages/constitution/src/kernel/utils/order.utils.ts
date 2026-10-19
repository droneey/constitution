import type { Finding } from '../types';

const compareText = (left: string, right: string): -1 | 0 | 1 => {
  if (left === right) {
    return 0;
  }

  // Stryker disable next-line EqualityOperator: equal texts returned above, so < and <= agree
  return left < right ? -1 : 1;
};

// By the code before the message, so a reworded message keeps its place.
const compareFindings = (left: Finding, right: Finding): -1 | 0 | 1 =>
  compareText(left.path, right.path) ||
  compareText(left.code, right.code) ||
  compareText(left.message, right.message);

export { compareFindings, compareText };
