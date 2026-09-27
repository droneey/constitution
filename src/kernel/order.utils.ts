import type { Finding } from './finding.types';

// biome-ignore lint/plugin/named-arguments: a comparator takes its two sides in order
const compareText = (left: string, right: string): number => {
  if (left === right) {
    return 0;
  }

  // Stryker disable next-line EqualityOperator: equal texts returned above, so < and <= agree
  return left < right ? -1 : 1;
};

// biome-ignore lint/plugin/named-arguments: a comparator takes its two sides in order
const compareFindings = (left: Finding, right: Finding): number =>
  compareText(left.path, right.path) ||
  compareText(left.message, right.message);

export { compareFindings, compareText };
