import { RELEASE_FOLDER } from '#/kernel/constants';
import type { ProjectFiles } from '#/kernel/contracts';
import type { ProjectWarning } from '#/kernel/entities';
import { ProjectUnit, WarningKind } from '#/kernel/entities';

interface ReleaseLoopsInput {
  readonly files: ProjectFiles;
  readonly project: string;
  readonly units: readonly ProjectUnit[];
}

// A unit whose link to the release leads back to a folder that holds the link, the unit's own or
// one above it: a tool that walks the unit follows it without end.
const releaseLoopsOf = (input: ReleaseLoopsInput): readonly ProjectWarning[] =>
  input.units.flatMap((unit) => {
    const folder = ProjectUnit.isRepository(unit) ? input.project : `${input.project}/${unit.path}`;
    const target = input.files.realFolder(`${folder}/${RELEASE_FOLDER}`);
    const segments = `${input.files.realFolder(folder)}/${RELEASE_FOLDER}`.split('/');
    const holders = segments.map((_, index) => segments.slice(0, index).join('/'));

    return holders.some((holder) => holder === target)
      ? [
          {
            details: {
              unit: unit.path,
            },
            kind: WarningKind.ReleaseLinkLoops,
          } satisfies ProjectWarning,
        ]
      : [];
  });

export { releaseLoopsOf };
