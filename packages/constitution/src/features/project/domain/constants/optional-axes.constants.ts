import { Axis } from '#/kernel/constants';

// Foundation is always followed; a project lists the others it follows.
const OPTIONAL_AXES = [
  Axis.Architecture,
  Axis.Workflow,
] as const;

export { OPTIONAL_AXES };
