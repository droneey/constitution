import type { Config } from 'style-dictionary/types';

const isRecord = (raw: unknown): raw is Readonly<Record<string, unknown>> =>
  typeof raw === 'object' && raw !== null && !Array.isArray(raw);

/** Tells whether a module's export is a list of configurations, each an object as Style Dictionary takes. */
const isConfigList = (raw: unknown): raw is Config[] => Array.isArray(raw) && raw.every(isRecord);

export { isConfigList };
