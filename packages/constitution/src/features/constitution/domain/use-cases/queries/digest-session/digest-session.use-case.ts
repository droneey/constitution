import type {
  Clock,
  ConfigParser,
  FrontMatterParser,
  ProjectFiles,
  WorkingTree,
} from '../../../contracts';
import type { ProjectWarning, SessionDigest, SessionStart, SessionState } from '../../../entities';
import { ConfigReadStatus, ProjectFailure, WarningCode } from '../../../entities';
import { ProjectError } from '../../../errors';
import { isPlainName } from '../../../utils';
import { checkWiring } from '../check-wiring';
import { archiveOf, findProject, readDeclaration, readRelease } from '../open-project';
import { digestOf, noticeOf, unparsedDigestOf } from './digest.utils';

const SESSION_START = 'SessionStart';
const STARTUP = 'startup';
const RESUME = 'resume';
const CORE = 'blocks/core/core.md';

interface DigestPorts {
  readonly clock: Clock;
  readonly configParser: ConfigParser;
  readonly files: ProjectFiles;
  readonly frontMatterParser: FrontMatterParser;
  readonly workingTree: WorkingTree;
}

// A wiring that cannot be checked costs its warnings, never the digest.
const wiringWarningsOf = (check: () => readonly ProjectWarning[]): readonly ProjectWarning[] => {
  try {
    return check();
  } catch {
    return [
      {
        code: WarningCode.Wiring,
        message: 'cannot check the wiring',
      },
    ];
  }
};

/**
 * The digest of the rules a session starts with, or undefined when no project around the start
 * declares any.
 *
 * @throws {@link ProjectError} when the release, constitution.yaml or core cannot be read
 */
const digestSession = (input: DigestPorts & SessionStart): SessionDigest | undefined => {
  const { files } = input;
  const project = findProject({
    files,
    start: input.start,
  });

  if (project === undefined) {
    return undefined;
  }

  const archive = archiveOf(project);
  const event = input.event === '' ? SESSION_START : input.event;
  const release = readRelease({
    archive,
    files,
  });

  if ('notice' in release) {
    return {
      digest: noticeOf({
        archive,
        format: release.format,
        notice: release.notice,
      }),
      event,
    };
  }

  const declaration = readDeclaration({
    ...input,
    archive,
    project,
  });
  const core = files.read(`${archive}/${CORE}`);

  if (core === undefined) {
    throw new ProjectError({
      code: ProjectFailure.CoreUnreadable,
      path: `${archive}/${CORE}`,
    });
  }

  const isKept = event === SESSION_START && isPlainName(input.session);
  const save = (kept: SessionState): SessionDigest['save'] =>
    isKept
      ? {
          isReminderKept: input.origin === RESUME,
          session: input.session,
          state: kept,
        }
      : undefined;

  if (declaration.status === ConfigReadStatus.Unparsed) {
    const kept = save({
      active: [],
      musts: [],
      project,
    });

    return {
      digest: unparsedDigestOf({
        archive,
        core,
        installed: release.installed,
        line: declaration.line,
      }),
      event,
      ...(kept === undefined
        ? {}
        : {
            save: kept,
          }),
    };
  }

  const { resolution } = declaration;
  const state = save({
    active: resolution.active,
    check: resolution.check,
    musts: resolution.musts,
    project,
  });

  return {
    digest: digestOf({
      archive,
      core,
      count: resolution.count,
      index: resolution.index,
      installed: release.installed,
      isStartup: event === SESSION_START && input.origin === STARTUP,
      warnings: [
        ...resolution.warnings,
        ...wiringWarningsOf(() =>
          checkWiring({
            archive,
            config: declaration.config,
            files,
            project,
            resolution,
            workingTree: input.workingTree,
          }),
        ),
      ],
    }),
    event,
    ...(state === undefined
      ? {}
      : {
          save: state,
        }),
  };
};

export type { DigestPorts };
export { digestSession };
