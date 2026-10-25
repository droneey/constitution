const isRecord = (raw: unknown): raw is Readonly<Record<string, unknown>> =>
  typeof raw === 'object' && raw !== null && !Array.isArray(raw);

/** Tells whether a module's export is a list of objects; Style Dictionary reads each as a configuration and checks its fields. */
const isConfigList = (raw: unknown): raw is readonly Readonly<Record<string, unknown>>[] =>
  Array.isArray(raw) && raw.every(isRecord);

export { isConfigList };
