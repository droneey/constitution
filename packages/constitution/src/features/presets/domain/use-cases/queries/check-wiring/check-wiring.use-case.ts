import type { ProjectWarning } from '#/kernel/entities';

import type { ConfigurationParser } from '../../../contracts';
import type { WiringInput } from '../shared/wiring';
import { contextOf, readsOf } from '../shared/wiring';
import { checkWiringOf } from './steps/check-configurations';
import { releaseLoopsOf } from './steps/find-release-loops';
import { unitSkipsOf } from './steps/find-unit-skips';

const checkWiring = (
  input: WiringInput & {
    parser: ConfigurationParser;
  },
): readonly ProjectWarning[] => {
  const context = contextOf(input);
  const reads = readsOf(input);

  return [
    ...releaseLoopsOf({
      files: input.files,
      project: input.project,
      units: input.resolution.units,
    }),
    ...checkWiringOf({
      context,
      reads,
    }),
    ...unitSkipsOf({
      context,
      parser: input.parser,
      reads,
    }),
  ];
};

export { checkWiring };
