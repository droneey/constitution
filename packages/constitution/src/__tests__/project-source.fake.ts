import type { ProjectSource } from '#/kernel/contracts';
import type { Declaration, OpenedProject, ProjectPlace, Release } from '#/kernel/entities';
import {
  BlockListing,
  BlockModel,
  ConfigReadStatus,
  ReleaseStatus,
  Resolution,
} from '#/kernel/entities';
import { ProjectError, ProjectFailure } from '#/kernel/errors';
import { Version } from '#/kernel/value-objects';

// A project as its source reads it: where it sits, the release it pins, what it declares and the
// text of core, each read or the failure its read throws.
interface FakeProject {
  readonly core?: string | Error;
  readonly declaration?: Declaration | Error;
  // no project is found when it is left out
  readonly place?: ProjectPlace;
  readonly release?: Release | Error;
}

const empty = Resolution.create({
  active: [],
  blocks: [],
  listing: BlockListing.create({
    overrides: [],
    repository: [],
    units: [],
  }),
  model: BlockModel.create({
    blocks: [],
    roles: [],
    rules: [],
  }),
  musts: [],
  units: [],
  warnings: [],
});

const CORE_TEXT = '# core\n';

const readOf = <TRead>(given: TRead | Error): TRead => {
  if (given instanceof Error) {
    throw given;
  }

  return given;
};

const createFakeProjectSource = (project: FakeProject = {}): ProjectSource => {
  const find = (start: string): ProjectPlace | undefined => {
    const { place } = project;

    return place !== undefined && (start === place.project || start.startsWith(`${place.project}/`))
      ? place
      : undefined;
  };

  const readDeclaration = (): Declaration =>
    readOf(
      project.declaration ?? {
        packs: [],
        resolution: empty,
        status: ConfigReadStatus.Parsed,
      },
    );

  return {
    find,
    open: (start: string): OpenedProject => {
      const place = find(start);

      if (place === undefined) {
        throw new ProjectError({
          code: ProjectFailure.NoProject,
          details: {
            path: start,
          },
        });
      }

      const declaration = readDeclaration();

      if (declaration.status === ConfigReadStatus.Unparsed) {
        throw new ProjectError({
          code: ProjectFailure.ConfigUnparsed,
          details: {
            line: declaration.line,
            path: `${place.project}/constitution.yaml`,
          },
        });
      }

      return {
        ...place,
        packs: declaration.packs,
        resolution: declaration.resolution,
      };
    },
    readCore: (): string => readOf(project.core ?? CORE_TEXT),
    readDeclaration,
    readRelease: (): Release =>
      readOf(
        project.release ?? {
          status: ReleaseStatus.Installed,
          version: Version.create('1.0.0'),
        },
      ),
  };
};

export type { FakeProject };
export { CORE_TEXT, createFakeProjectSource };
