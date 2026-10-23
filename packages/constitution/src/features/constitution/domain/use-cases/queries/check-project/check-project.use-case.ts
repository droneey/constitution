import type {
  Clock,
  ConfigParser,
  FrontMatterParser,
  ProjectFiles,
  WorkingTree,
} from '../../../contracts';
import type { ProjectWarning } from '../../../entities';
import { checkWiring } from '../check-wiring';
import { findProject, openProject } from '../open-project';

interface ProjectPorts {
  readonly clock: Clock;
  readonly configParser: ConfigParser;
  readonly files: ProjectFiles;
  readonly frontMatterParser: FrontMatterParser;
  readonly workingTree: WorkingTree;
}

/**
 * What is wrong with the declaration of the project around the start folder and with its wiring,
 * the warnings a session's digest gives; undefined when no project is there.
 *
 * @throws {@link ProjectError} when its release is not installed, or its constitution.yaml or its
 * blocks cannot be read
 */
const checkProject = (
  input: ProjectPorts & {
    start: string;
  },
): readonly ProjectWarning[] | undefined => {
  if (findProject(input) === undefined) {
    return undefined;
  }

  const opened = openProject(input);

  return [
    ...opened.resolution.warnings,
    ...checkWiring({
      ...opened,
      files: input.files,
      workingTree: input.workingTree,
    }),
  ];
};

export type { ProjectPorts };
export { checkProject };
