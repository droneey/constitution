import * as architectureWorkspace from './.droneey/constitution/presets/typescript/dependency-cruiser/architecture/workspace.mjs';
import * as self from './.droneey/constitution/presets/typescript/dependency-cruiser/foundation/self.mjs';

// dependency-cruiser's extends keeps the first of two rules of one name, so the parts are joined
// instead: every list after the lists before it and every table merged into the one before it, then
// the rules a part builds over the development files every part names.
const isRecord = (setting) =>
  typeof setting === 'object' && setting !== null && !Array.isArray(setting);
const join = (...parts) => {
  const joined = {};

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
const modules = [
  self,
  architectureWorkspace,
];
const developmentFiles = modules.flatMap((next) => next.developmentFiles ?? []);

export default join(...modules.map((next) => next.default ?? {}), {
  forbidden: modules.flatMap((next) => next.forbiddenOver?.(developmentFiles) ?? []),
});
