import type { Oklch } from '../types';

const OKLCH_COMPONENTS = 3;

const isRecord = (raw: unknown): raw is Readonly<Record<string, unknown>> =>
  typeof raw === 'object' && raw !== null && !Array.isArray(raw);

const isNumberList = (raw: unknown): raw is readonly number[] =>
  Array.isArray(raw) && raw.every((entry) => typeof entry === 'number');

const isOklch = (raw: unknown): raw is Oklch =>
  isNumberList(raw) && raw.length === OKLCH_COMPONENTS;

export { isNumberList, isOklch, isRecord };
