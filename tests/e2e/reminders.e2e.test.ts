import { realpathSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import {
  HookEvent,
  newSession,
  outputOf,
  removeSessions,
  runHook,
  runScript,
} from './hook.fixtures';
import { createPluginRoot, removePluginRoots } from './plugin-root.fixtures';
import { configOf, createProject, removeProjects } from './project.fixtures';

let root = '';

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

const touch = (input: {
  filePath: string;
  session: string;
  toolName?: string;
}): string =>
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
      filePath: join(project, 'src/features/orders/ui/order-card.tsx'),
      session,
    });

    // Assert
    const { context } = outputOf({
      exitCode: 0,
      stderr: '',
      stdout: reminder,
    });

    expect({
      files: context.includes('read blocks/domains/ui/ui.md'),
      musts: context.includes('its MUST rules: '),
      opening: context.startsWith(
        'ui governs src/features/orders/ui/order-card.tsx: ',
      ),
      within: context.length <= 300,
    }).toStrictEqual({
      files: true,
      musts: true,
      opening: true,
      within: true,
    });
  });

  it.each([
    'src/shared/components/button.tsx',
    'styles/theme.css',
    'styles/theme.scss',
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
    expect(reminder).toContain(`ui governs ${path}: `);
  });

  it.each([
    {
      condition: 'no active block governs the file',
      path: 'src/features/orders/domain/order.ts',
    },
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
      filePath: path.startsWith('/') ? path : join(project, path),
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
    const { context } = outputOf({
      exitCode: 0,
      stderr: '',
      stdout: reminder,
    });

    expect(
      context
        .split('\n')
        .map((note) => note.split(' ')[0])
        .toSorted(),
    ).toStrictEqual([
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

  it('should remind again when the context was cleared', () => {
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
    runHook({
      event: HookEvent.Clear,
      project,
      root,
      session,
    });

    // Act
    const reminder = touch({
      filePath: join(project, 'src/features/orders/ui/order-card.tsx'),
      session,
    });

    // Assert
    expect(reminder).not.toBe('');
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
