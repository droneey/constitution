import type { ConfigurationParser } from '#/features/presets';
import { checkWiring } from '#/features/presets';
import type { WiringCheck, WiringReport } from '#/features/session';
import { WiringCheckStatus } from '#/features/session';
import type { ProjectFiles, WorkingTree } from '#/kernel/contracts';
import type { OpenedProject } from '#/kernel/entities';

interface PresetsWiringCheckInput {
  readonly files: ProjectFiles;
  readonly parser: ConfigurationParser;
  readonly workingTree: WorkingTree;
}

const createPresetsWiringCheck = (input: PresetsWiringCheckInput): WiringCheck => ({
  check: (project: OpenedProject): WiringReport => {
    try {
      return {
        status: WiringCheckStatus.Checked,
        warnings: checkWiring({
          ...project,
          files: input.files,
          parser: input.parser,
          workingTree: input.workingTree,
        }),
      };
    } catch (cause) {
      // The boundary of an optional part: any failure of the check, a defect included, costs the
      // digest its wiring's warnings and is reported as unchecked, never the session's start.
      return {
        cause,
        status: WiringCheckStatus.Unchecked,
      };
    }
  },
});

export { createPresetsWiringCheck };
