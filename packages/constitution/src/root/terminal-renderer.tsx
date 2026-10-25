import type { AccentTokens, Output, StepContent } from '@droneey/design-cli';
import { StepStatus } from '@droneey/design-cli';
import type { TerminalStreams, TerminalView } from '@droneey/design-cli/ink';
import { openTerminalView, TaskList } from '@droneey/design-cli/ink';

import type { Renderer, Report, Task } from '#/shared/cli';
import { SectionKind } from '#/shared/cli';
import { SectionView } from '#/shared/ui';

interface TerminalRenderer extends Renderer {
  readonly close: () => Promise<void>;
}

// Ink draws a running step on its next turn: the work waits for it so the step shows first.
// Stryker disable next-line BlockStatement: Ink writes no frame but its last in CI, where the specs run, so the running step is seen only on a terminal
const nextTurn = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setImmediate(resolve);
  });
};

/**
 * Ink draws on the streams; the lines of data, which it never draws, go to standard output through
 * write.
 */
const createTerminalRenderer = (input: {
  accent: AccentTokens;
  output: Output;
  streams: {
    readonly stderr: NodeJS.WritableStream;
    readonly stdin: NodeJS.ReadableStream;
    readonly stdout: NodeJS.WritableStream;
  };
  write: (text: string) => void;
}): TerminalRenderer => {
  const settled: StepContent[] = [];
  let progress: TerminalView | undefined;

  const viewOn = (stdout: TerminalStreams['stdout']): TerminalView =>
    openTerminalView({
      accent: input.accent,
      output: input.output,
      streams: {
        stdin: input.streams.stdin,
        stdout,
      },
    });

  const closeProgress = async (): Promise<void> => {
    const open = progress;

    progress = undefined;
    await open?.close();
  };

  return {
    close: closeProgress,
    print: async (report: Report): Promise<void> => {
      await closeProgress();

      for (const [index, section] of report.entries()) {
        if (index > 0) {
          input.write('\n');
        }

        // lines of data are printed as they are, where Ink would wrap them at the terminal's width
        if (section.kind === SectionKind.Lines) {
          input.write(`${section.lines.join('\n')}\n`);
        } else {
          const view = viewOn(input.streams.stdout);

          try {
            view.show(<SectionView section={section} />);
          } finally {
            // biome-ignore lint/performance/noAwaitInLoops: each section is drawn after the one before it, on the one stream
            await view.close();
          }
        }
      }
    },
    run: async <TResult,>(task: Task<TResult>): Promise<TResult> => {
      const view = progress ?? viewOn(input.streams.stderr);

      progress = view;
      view.show(
        <TaskList
          // Stryker disable next-line ArrayDeclaration: Ink writes no frame but its last in CI, where the specs run, so the running step is seen only on a terminal
          steps={[
            ...settled,
            {
              label: task.label,
              status: StepStatus.Running,
            },
          ]}
        />,
      );
      await nextTurn();

      const returned = await task.run();

      settled.push({
        ...task.outcomeOf(returned),
        label: task.label,
      });
      view.show(
        <TaskList
          // Stryker disable next-line ArrayDeclaration: Ink writes no frame but its last in CI, where the specs run, so the running step is seen only on a terminal
          steps={[
            ...settled,
          ]}
        />,
      );

      return returned;
    },
  };
};

export { createTerminalRenderer };
