const compareText = (left: string, right: string): -1 | 0 | 1 => {
  if (left === right) {
    return 0;
  }

  // Stryker disable next-line EqualityOperator: equal texts returned above, so < and <= agree
  return left < right ? -1 : 1;
};

export { compareText };
