import { MutationRunError } from '../domain/check/errors';
import { fakeMutationRunner } from './mutation-runner.fake.ts';
import type { ToolEnd } from './mutation-runner.suite.ts';
import { MUTATE_SCENARIO, mutationRunnerSuite } from './mutation-runner.suite.ts';

const runEndOf = (toolEnd: ToolEnd) =>
  'failure' in toolEnd
    ? {
        runFailure: new MutationRunError({
          code: toolEnd.failure,
          toolName: 'stryker',
        }),
      }
    : {
        exitCode: toolEnd.exitCode,
        unmutatedPaths: MUTATE_SCENARIO.unmutatedPaths,
      };

mutationRunnerSuite({
  implementationName: 'the fake',
  runnerEndingWith: (toolEnd) => fakeMutationRunner(runEndOf(toolEnd)),
});
