import type { Config } from 'style-dictionary/types';

import type { ThemeModeFiles } from '#/libs/resolver';

import type { ConfigOfMode } from '../types';

/** The platform's configuration of each mode, reading the files every mode takes and the mode's own in place of any it names. */
const configsOf = (configOf: ConfigOfMode, modes: readonly ThemeModeFiles[]): Config[] =>
  modes.map(({ name, isDefault, shared, own }) => ({
    ...configOf({
      name,
      isDefault,
    }),
    include: [
      ...shared,
    ],
    source: [
      ...own,
    ],
  }));

export { configsOf };
