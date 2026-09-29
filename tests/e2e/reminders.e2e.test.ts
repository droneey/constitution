import { mkdtempSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, afterEach, beforeAll, describe, expect, it } from 'bun:test';

import { HookEvent, outputOf, runHook, runScript } from './hook.fixtures';
import { createPluginRoot, removePluginRoots } from './plugin-root.fixtures';
import { configOf, createProject, removeProjects } from './project.fixtures';

const SESSION = 'session-1';

let root = '';
const tmpDirs: string[] = [];

const startSession = (
  config: string,
): {
  project: string;
  tmpDir: string;
} => {
  const project = realpathSync(
    createProject({
      config,
    }),
  );
  const tmpDir = mkdtempSync(join(tmpdir(), 'constitution-state-'));

  tmpDirs.push(tmpDir);
  runHook({
    event: HookEvent.Startup,
    project,
    root,
    session: SESSION,
    tmpDir,
  });

  return {
    project,
    tmpDir,
  };
};

const touch = (input: {
  filePath: string;
  session?: string;
  tmpDir: string;
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
        input.session ?? SESSION,
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
    tmpDir: input.tmpDir,
  }).stdout;

beforeAll(() => {
  root = createPluginRoot();
});

afterEach(() => {
  removeProjects();

  for (const folder of tmpDirs.splice(0)) {
    rmSync(folder, {
      force: true,
      recursive: true,
    });
  }
});

afterAll(() => {
  removePluginRoots();
});

describe('the reminders of the post-tool-use hook', () => {
  it('should name the block that governs a file, its files and its MUST rules when the agent first touches it', () => {
    // Arrange
    const { project, tmpDir } = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    // Act
    const reminder = touch({
      filePath: join(project, 'src/features/orders/ui/order-card.tsx'),
      tmpDir,
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
    const { project, tmpDir } = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    // Act
    const reminder = touch({
      filePath: join(project, path),
      tmpDir,
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
    const { project, tmpDir } = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    // Act
    const reminder = touch({
      filePath: path.startsWith('/') ? path : join(project, path),
      tmpDir,
    });

    // Assert
    expect(reminder).toBe('');
  });

  it('should say nothing when the block that governs a touched file was named before', () => {
    // Arrange
    const { project, tmpDir } = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    touch({
      filePath: join(project, 'src/features/orders/ui/order-card.tsx'),
      tmpDir,
    });

    // Act
    const reminder = touch({
      filePath: join(project, 'src/shared/components/button.tsx'),
      tmpDir,
      toolName: 'Edit',
    });

    // Assert
    expect(reminder).toBe('');
  });

  it('should remind again when the context was cleared', () => {
    // Arrange
    const { project, tmpDir } = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    touch({
      filePath: join(project, 'src/features/orders/ui/order-card.tsx'),
      tmpDir,
    });
    runHook({
      event: HookEvent.Clear,
      project,
      root,
      session: SESSION,
      tmpDir,
    });

    // Act
    const reminder = touch({
      filePath: join(project, 'src/features/orders/ui/order-card.tsx'),
      tmpDir,
    });

    // Assert
    expect(reminder).not.toBe('');
  });

  it('should say nothing when the session saved no state', () => {
    // Arrange
    const { project, tmpDir } = startSession(
      configOf({
        domains: '[ui]',
      }),
    );

    // Act
    const reminder = touch({
      filePath: join(project, 'src/features/orders/ui/order-card.tsx'),
      session: 'session-2',
      tmpDir,
    });

    // Assert
    expect(reminder).toBe('');
  });
});
