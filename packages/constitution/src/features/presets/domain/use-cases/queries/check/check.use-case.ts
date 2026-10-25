import type { ProjectFiles, ProjectSource, WorkingTree } from '#/kernel/contracts';
import type { ProjectWarning } from '#/kernel/entities';

import type { ConfigurationParser } from '../../../contracts';
import { checkWiring } from '../check-wiring';

interface PresetsPorts {
  readonly files: ProjectFiles;
  readonly source: ProjectSource;
  readonly workingTree: WorkingTree;
}

/**
 * What is wrong with the declaration of the project around the start folder and with its wiring,
 * the warnings a session's digest gives; undefined when no project is there.
 *
 * @throws {@link ProjectError} when its release is not installed, or its constitution.yaml or its
 * blocks cannot be read
 */
const checkPresets = (
  input: PresetsPorts & {
    parser: ConfigurationParser;
    start: string;
  },
): readonly ProjectWarning[] | undefined => {
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

export type { PresetsPorts };
export { checkPresets };
