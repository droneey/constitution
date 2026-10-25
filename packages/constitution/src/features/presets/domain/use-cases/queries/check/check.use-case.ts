import type { ProjectWarning } from '#/kernel/entities';

import type { ConfigurationParser } from '../../../contracts';
import { checkWiring } from '../check-wiring';
import type { PresetsPorts } from '../shared/presets-ports';

interface CheckPresetsInput extends PresetsPorts {
  readonly parser: ConfigurationParser;
  readonly start: string;
}

/**
 * What is wrong with the declaration of the project around the start folder and with its wiring,
 * the warnings a session's digest gives; undefined when no project is there.
 *
 * @throws {@link ProjectError} when its release is not installed, or its constitution.yaml or its
 * blocks cannot be read
 */
const checkPresets = (input: CheckPresetsInput): readonly ProjectWarning[] | undefined => {
  if (input.source.find(input.start) === undefined) {
    return undefined;
  }

  const opened = input.source.open(input.start);

  return [
    ...opened.resolution.warnings,
    ...checkWiring({
      ...opened,
      files: input.files,
      parser: input.parser,
      workingTree: input.workingTree,
    }),
  ];
};

export { checkPresets };
