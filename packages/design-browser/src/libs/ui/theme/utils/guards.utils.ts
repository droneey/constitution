import type { Oklch } from '../types';

const OKLCH_COMPONENTS = 3;

const isRecord = (raw: unknown): raw is Readonly<Record<string, unknown>> =>
  typeof raw === 'object' && raw !== null && !Array.isArray(raw);

const isOklch = (raw: unknown): raw is Oklch =>
  Array.isArray(raw) &&
  raw.length === OKLCH_COMPONENTS &&
  raw.every((component) => typeof component === 'number');

export { isOklch, isRecord };
