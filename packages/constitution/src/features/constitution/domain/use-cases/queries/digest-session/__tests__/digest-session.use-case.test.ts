import { describe, expect, it } from 'bun:test';

import { CONFIG, CORE, PROJECT } from '../../../../../__tests__/project.fixtures';
import { createFakeProjectFiles } from '../../../../../__tests__/project-files.fake';
import { ProjectFailure } from '../../../../entities';
import { ProjectError } from '../../../../errors';
import { digestSession } from '../digest-session.use-case';
import {
  QUIET_CONFIG,
  sessionPortsOf,
  sessionTreeOf,
  uncheckableFilesOf,
} from './digest-session.fixtures';

const RELEASE =
  "The Droneey Constitution 1.0.0 supplies this repository's rules. Block files live under /work/project/.droneey/constitution.";
const ONE_BLOCK = 'constitution.yaml makes 1 block active.';
const WIRING = '- wiring: cannot check the wiring';
const KEPT = {
  active: [],
  check: 'bun run check',
  musts: [],
  project: PROJECT,
};

describe('digestSession', () => {
  it.each([
    {
      condition: 'a session starts up',
      event: 'SessionStart',
      heading: '⚠️ Warnings — tell the user at the start of the session',
      named: 'SessionStart',
      origin: 'startup',
      save: {
        save: {
          isReminderKept: false,
          session: 'session-1',
          state: KEPT,
        },
      },
      session: 'session-1',
    },
    {
      condition: 'an event that names nothing resumes a session',
      event: '',
      heading: '⚠️ Warnings',
      named: 'SessionStart',
      origin: 'resume',
      save: {
        save: {
          isReminderKept: true,
          session: 'session-1',
          state: KEPT,
        },
      },
      session: 'session-1',
    },
    {
      condition: 'a subagent starts',
      event: 'SubagentStart',
      heading: '⚠️ Warnings',
      named: 'SubagentStart',
      origin: 'startup',
      save: {},
      session: 'session-1',
    },
    {
      condition: 'a session whose id is not a plain name starts up',
      event: 'SessionStart',
      heading: '⚠️ Warnings — tell the user at the start of the session',
      named: 'SessionStart',
      origin: 'startup',
      save: {},
      session: 'x/y',
    },
  ])(
    'should warn of a wiring it cannot check and keep the state only of a session when $condition',
    ({ event, heading, named, origin, save, session }) => {
      // Arrange
      const ports = sessionPortsOf(uncheckableFilesOf(sessionTreeOf()));

      // Act
      const digest = digestSession({
        ...ports,
        event,
        origin,
        session,
        start: PROJECT,
      });

      // Assert
      expect(digest).toStrictEqual({
        digest: {
          body: [
            heading,
            WIRING,
            '',
            '# core',
          ],
          head: [
            RELEASE,
            ONE_BLOCK,
          ],
        },
        event: named,
        ...save,
      });
    },
  );

  it('should give the warnings of constitution.yaml before those of the wiring when both warn', () => {
    // Arrange
    const ports = sessionPortsOf(
      uncheckableFilesOf(
        sessionTreeOf({
          config: QUIET_CONFIG.replace('domains: []', 'domains: [nope]'),
        }),
      ),
    );

    // Act
    const digest = digestSession({
      ...ports,
      event: 'SubagentStart',
      origin: 'startup',
      session: 'session-1',
      start: PROJECT,
    });

    // Assert
    expect(digest).toStrictEqual({
      digest: {
        body: [
          '⚠️ Warnings',
          '- unknown: nope is not a block — check the name',
          WIRING,
          '',
          '# core',
        ],
        head: [
          RELEASE,
          ONE_BLOCK,
        ],
      },
      event: 'SubagentStart',
    });
  });

  it('should give core and the count alone when nothing warns', () => {
    // Arrange
    const ports = sessionPortsOf(createFakeProjectFiles(sessionTreeOf()));

    // Act
    const digest = digestSession({
      ...ports,
      event: 'SubagentStart',
      origin: 'startup',
      session: 'session-1',
      start: PROJECT,
    });

    // Assert
    expect(digest).toStrictEqual({
      digest: {
        body: [
          '# core',
        ],
        head: [
          RELEASE,
          ONE_BLOCK,
        ],
      },
      event: 'SubagentStart',
    });
  });

  it.each([
    {
      condition: 'a session starts',
      event: 'SessionStart',
      save: {
        save: {
          isReminderKept: false,
          session: 'session-1',
          state: {
            active: [],
            musts: [],
            project: PROJECT,
          },
        },
      },
    },
    {
      condition: 'a subagent starts',
      event: 'SubagentStart',
      save: {},
    },
  ])(
    'should give core alone, and keep no check, when constitution.yaml does not parse and $condition',
    ({ event, save }) => {
      // Arrange
      const ports = sessionPortsOf(
        createFakeProjectFiles(
          sessionTreeOf({
            config: 'domains: [ui\n',
          }),
        ),
      );

      // Act
      const digest = digestSession({
        ...ports,
        event,
        origin: 'startup',
        session: 'session-1',
        start: PROJECT,
      });

      // Assert
      expect(digest).toStrictEqual({
        digest: {
          body: [
            '# core',
          ],
          head: [
            RELEASE,
            'constitution.yaml does not parse at line 1; only core applies.',
          ],
        },
        event,
        ...save,
      });
    },
  );

  it('should give the notice alone, and keep no state, when no release is installed', () => {
    // Arrange
    const ports = sessionPortsOf(
      createFakeProjectFiles({
        files: {
          [`${PROJECT}/.git/HEAD`]: 'ref: refs/heads/main\n',
          [CONFIG]: QUIET_CONFIG,
        },
      }),
    );

    // Act
    const digest = digestSession({
      ...ports,
      event: '',
      origin: 'startup',
      session: 'session-1',
      start: PROJECT,
    });

    // Assert
    expect(digest).toStrictEqual({
      digest: {
        body: [],
        head: [
          'The Droneey Constitution is not installed in this repository: /work/project/.droneey/constitution does not exist, so no rules are given.',
          'Tell the user to run mise install, which installs the release mise.toml pins as github:droneey/constitution and links it there.',
        ],
      },
      event: 'SessionStart',
    });
  });

  it('should give nothing when no project lies around the start', () => {
    // Arrange
    const ports = sessionPortsOf(createFakeProjectFiles(sessionTreeOf()));

    // Act
    const digest = digestSession({
      ...ports,
      event: 'SessionStart',
      origin: 'startup',
      session: 'session-1',
      start: '/elsewhere',
    });

    // Assert
    expect(digest).toBeUndefined();
  });

  it('should fail with the path of core when core cannot be read', () => {
    // Arrange
    const ports = sessionPortsOf(
      createFakeProjectFiles({
        ...sessionTreeOf(),
        unreadable: [
          CORE,
        ],
      }),
    );

    // Act
    const act = (): unknown =>
      digestSession({
        ...ports,
        event: 'SessionStart',
        origin: 'startup',
        session: 'session-1',
        start: PROJECT,
      });

    // Assert
    expect(act).toThrow(
      new ProjectError({
        code: ProjectFailure.CoreUnreadable,
        path: CORE,
      }),
    );
  });
});
