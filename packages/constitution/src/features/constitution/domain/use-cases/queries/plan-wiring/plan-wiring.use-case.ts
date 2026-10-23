import type {
  Clock,
  ConfigParser,
  FrontMatterParser,
  ProjectFiles,
  WorkingTree,
} from '../../../contracts';
import { planWiring } from '../check-wiring';
import { openProject } from '../open-project';

/**
 * The configuration files the project's tools read, each with the units it serves, its template
 * and the parts it takes, as /ratify writes them.
 *
 * @throws {@link ProjectError} when no project is found, its release is not installed, or its
 * constitution.yaml or its blocks cannot be read
 */
const planProjectWiring = (input: {
  clock: Clock;
  configParser: ConfigParser;
  files: ProjectFiles;
  frontMatterParser: FrontMatterParser;
  start: string;
  workingTree: WorkingTree;
}): readonly string[] => {
  const opened = openProject(input);

  return planWiring({
    ...opened,
    files: input.files,
    workingTree: input.workingTree,
  });
};

export { planProjectWiring };
