/**
 * @typedef {Record<string, unknown>} Settings
 * @typedef {{
 *   default?: Settings;
 *   developmentFiles?: readonly string[];
 *   settingsOver?: (developmentFiles: readonly string[]) => Settings;
 * }} Module
 */

/**
 * @param {unknown} setting
 * @returns {setting is Settings}
 */
const isRecord = (setting) =>
  typeof setting === 'object' && setting !== null && !Array.isArray(setting);

/**
 * @param {unknown} part
 * @returns {part is Module}
 */
const isModule = (part) => Object.prototype.toString.call(part) === '[object Module]';

/**
 * @param {readonly Settings[]} settings
 * @returns {Settings}
 */
const merged = (settings) => {
  /** @type {Settings} */
  const joined = {};

  for (const next of settings) {
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

/**
 * Joins the parts of a tool that has no extends, or whose extends loses settings, and then the
 * project's own settings: every list after the lists before it and every table merged into the one
 * before it. A part imported as a module gives its default export, and the settings its
 * `settingsOver` builds over the `developmentFiles` every module names follow the parts.
 *
 * @param {...(Settings | Module)} parts
 * @returns {Settings}
 */
export const join = (...parts) => {
  const modules = parts.filter(isModule);
  const developmentFiles = modules.flatMap((part) => part.developmentFiles ?? []);
  const built = modules.flatMap((part) =>
    part.settingsOver === undefined
      ? []
      : [
          part.settingsOver(developmentFiles),
        ],
  );
  const settings = parts.map((part) => (isModule(part) ? (part.default ?? {}) : part));

  settings.splice(parts.findLastIndex(isModule) + 1, 0, ...built);

  return merged(settings);
};
