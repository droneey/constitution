import part from '<parts>';

// knip has no extends: the parts are joined, every list after the lists before it and
// every table merged into the one before it.
type Settings = Record<string, unknown>;

const isRecord = (setting: unknown): setting is Settings =>
  typeof setting === 'object' && setting !== null && !Array.isArray(setting);
const join = (...parts: readonly Settings[]): Settings => {
  const joined: Settings = {};

  for (const next of parts) {
    for (const [key, setting] of Object.entries(next)) {
      const before = joined[key];

      if (Array.isArray(before) && Array.isArray(setting)) {
        joined[key] = [
          ...before,
          ...setting,
        ];
      } else if (isRecord(before) && isRecord(setting)) {
        joined[key] = {
          ...before,
          ...setting,
        };
      } else {
        joined[key] = setting;
      }
    }
  }

  return joined;
};

export default join(
  part,
  // the project's own settings, joined after the parts
  {},
);
