import type { ProjectFiles, ProjectSource } from '#/kernel/contracts';

import type { ConfigurationFormat, PresetFileParser, ReleaseBuilds } from '../../../contracts';
import type {
  AppliedFilesCommandRepository,
  LockCommandRepository,
} from '../../../contracts/repositories/commands';
import type { ApplyReport, FileText } from '../../../entities';
import { PresetsCode } from '../../../entities';
import { computeFiles } from '../../shared/compute-files';
import { computePresets } from '../../shared/compute-presets';

interface ApplyPresetsInput {
  readonly builds: ReleaseBuilds;
  readonly files: ProjectFiles;
  readonly formats: ConfigurationFormat;
  readonly locks: LockCommandRepository;
  readonly parser: PresetFileParser;
  readonly source: ProjectSource;
  readonly start: string;
  readonly writes: AppliedFilesCommandRepository;
}

const SEPARATOR = '/';

/**
 * A setting the user keeps in a file stays, and one of ours the user changed stays changed and is
 * reported. Undefined where no project is.
 *
 * @throws {@link ProjectError} when its release is not installed, or its constitution.yaml or its
 * blocks cannot be read
 * @throws {@link ApplyError} when a file cannot be written, which leaves every file as it was
 */
const applyPresets = (input: ApplyPresetsInput): ApplyReport | undefined => {
  if (input.source.find(input.start) === undefined) {
    return undefined;
  }

  const opened = input.source.open(input.start);
  const plan = computePresets({
    builds: input.builds,
    files: input.files,
    model: opened.resolution.model,
    packs: opened.packs,
    parser: input.parser,
    project: opened.project,
    releaseFolder: opened.releaseFolder,
    units: opened.resolution.units,
  });
  const units = computeFiles({
    files: input.files,
    formats: input.formats,
    lockOf: input.locks.read,
    plans: plan.files,
    project: opened.project,
    units: opened.resolution.units,
  });
  const files = units.flatMap((unit) => unit.files);
  const texts: readonly FileText[] = files.flatMap(({ file, text }) =>
    text === undefined
      ? []
      : [
          {
            path: `${opened.project}${SEPARATOR}${file}`,
            text,
          },
        ],
  );
  const locks = units.flatMap((unit) =>
    unit.lock === undefined
      ? []
      : [
          unit.lock,
        ],
  );

  const wroteIn = (at: number): boolean =>
    // Stryker disable next-line OptionalChaining: the files are computed for each unit, in its order
    units[at]?.files.some((file) => file.text !== undefined) === true;

  input.writes.write({
    files: texts,
    locks: locks.map((lock) => lock.next),
  });

  return {
    added: files.flatMap((file) => file.added),
    findings: [
      // A tool no runner runs is the check's to report: the files are written all the same.
      ...plan.findings.filter((finding) => finding.code !== PresetsCode.ToolWithoutRunner),
      ...units.flatMap((unit) => unit.findings),
      ...files.flatMap((file) => file.findings),
    ],
    removed: files.flatMap((file) => file.removed),
    units: opened.resolution.units
      .filter((_unit, at) => wroteIn(at))
      .map((unit) => String(unit.path)),
    written: [
      ...files.flatMap(({ file, text }) =>
        text === undefined
          ? []
          : [
              file,
            ],
      ),
      ...locks.map((lock) => lock.file),
    ],
  };
};

export type { ApplyPresetsInput };
export { applyPresets };
