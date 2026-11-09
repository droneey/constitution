const PROGRESS_RING = {
  cx: 8,
  cy: 8,
  r: 6.5,
  // Stryker disable next-line StringLiteral: the ring's paint, which a spec could only restate
  fill: 'none',
} as const;

const circumference = 2 * Math.PI * PROGRESS_RING.r;

export { circumference, PROGRESS_RING };
