import { realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import {
  HookEvent,
  mentionedOf,
  newSession,
  outputOf,
  remindedOf,
  removeSessions,
  runHook,
  runScript,
} from '../hook.fixtures';
import { createPluginRoot, removePluginRoots } from '../plugin-root.fixtures';
import { configOf, createProject, removeProjects } from '../project.fixtures';

let root = '';

const ORDER_CARD = 'src/features/orders/ui/order-card.tsx';
// The file a note names, ui's passport and one of its MUST rules.
const UI_NAMES = [
  ORDER_CARD,
  'blocks/domains/ui/ui.md',
  'four-data-states',
];

const startSession = (
  config: string,
): {
  project: string;
  session: string;
} => {
  const project = realpathSync(
    createProject({
      config,
    }),
  );
  const session = newSession();

  runHook({
    event: HookEvent.Startup,
    project,
    root,
    session,
  });

  return {
    project,
    session,
  };
};

const touch = (input: { filePath: string; session: string; toolName?: string }): string =>
  runScript({
    event: Object.fromEntries([
      [
        'hook_event_name',
        'PostToolUse',
      ],
      [
        'session_id',
        input.session,
      ],
      [
        'tool_input',
        Object.fromEntries([
          [
            'file_path',
            input.filePath,
          ],
        ]),
      ],
      [
        'tool_name',
        input.toolName ?? 'Read',
      ],
    ]),
    root,
    script: 'post-tool-use.sh',
  }).stdout;

beforeAll(() => {
  root = createPluginRoot();
});

afterEach(() => {
  removeProjects();
  removeSessions();
});

afterAll(() => {
  removePluginRoots();
});

describe('the reminders of the post-tool-use hook', () => {
  it('should name the block that governs a file, its files and its MUST rules when the agent first touches it', () => {
    // Arrange
    const { project, session } = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    // Act
    const reminder = touch({
      filePath: join(project, ORDER_CARD),
      session,
    });

    // Assert
    const { context } = outputOf({
      exitCode: 0,
      stderr: '',
      stdout: reminder,
    });

    expect({
      blocks: remindedOf(reminder),
      mentioned: mentionedOf({
        names: UI_NAMES,
        text: context,
      }),
      within: context.length <= 300,
    }).toStrictEqual({
      blocks: [
        'ui',
      ],
      mentioned: UI_NAMES,
      within: true,
    });
  });

  it.each([
    'styles/theme.css',
  ])('should name the block when a glob of it matches %s', (path) => {
    // Arrange
    const { project, session } = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    // Act
    const reminder = touch({
      filePath: join(project, path),
      session,
    });

    // Assert
    expect({
      blocks: remindedOf(reminder),
      mentioned: mentionedOf({
        names: [
          path,
        ],
        text: reminder,
      }),
    }).toStrictEqual({
      blocks: [
        'ui',
      ],
      mentioned: [
        path,
      ],
    });
  });

  it.each([
    {
      condition: 'a single star would have to cross a folder',
      path: 'styles/themes/dark.css',
    },
    {
      condition: 'a dot of the glob would have to match another character',
      path: 'styles/themexcss',
    },
    {
      condition: 'the file lies outside the project',
      path: '/elsewhere/ui/card.tsx',
    },
  ])('should say nothing when $condition', ({ path }) => {
    // Arrange
    const { project, session } = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    // Act
    const reminder = touch({
      filePath: resolve(project, path),
      session,
    });

    // Assert
    expect(reminder).toBe('');
  });

  it('should name every block the governing block needs, through its requirements, bases and seams, when the agent first touches a file', () => {
    // Arrange
    const { project, session } = startSession(
      configOf({
        domains: '[ui, untrusted-client, unreliable-network]',
        implementations: '[react-dom]',
        platforms: '[browser]',
      }),
    );

    // Act
    const reminder = touch({
      filePath: join(project, 'src/main.tsx'),
      session,
    });

    // Assert
    expect(remindedOf(reminder)).toStrictEqual([
      '_react',
      'browser',
      'react-dom',
      'ui',
      'unreliable-network',
      'untrusted-client',
    ]);
  });

  it('should mark a rule an override lowered when the block that governs the file is named', () => {
    // Arrange
    const { project, session } = startSession(
      configOf({
        domains: '[ui]',
        overrides:
          '\n  - rule: four-data-states\n    level: MAY\n    reason: "The admin screens show their state in the toolbar"',
      }),
    );

    // Act
    const reminder = touch({
      filePath: join(project, 'src/features/orders/ui/order-card.tsx'),
      session,
    });

    // Assert
    expect(reminder).toContain('four-data-states (MAY)');
  });

  it('should say nothing when the block that governs a touched file was named before', () => {
    // Arrange
    const { project, session } = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    touch({
      filePath: join(project, 'src/features/orders/ui/order-card.tsx'),
      session,
    });

    // Act
    const reminder = touch({
      filePath: join(project, 'src/shared/components/button.tsx'),
      session,
      toolName: 'Edit',
    });

    // Assert
    expect(reminder).toBe('');
  });

  it('should say nothing when the session saved no state', () => {
    // Arrange
    const { project } = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    // Act
    const reminder = touch({
      filePath: join(project, 'src/features/orders/ui/order-card.tsx'),
      session: newSession(),
    });

    // Assert
    expect(reminder).toBe('');
  });
});
