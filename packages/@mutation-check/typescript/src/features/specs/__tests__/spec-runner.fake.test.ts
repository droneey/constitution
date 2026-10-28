import { fakeSpecRunner } from './spec-runner.fake.ts';
import { SPEC_SCENARIO, specRunnerSuite } from './spec-runner.suite.ts';

specRunnerSuite({
  implementationName: 'the fake',
  runnerOfScenario: () =>
    fakeSpecRunner({
      failingPaths: [
        SPEC_SCENARIO.failingPath,
      ],
      specPaths: [
        SPEC_SCENARIO.failingPath,
        SPEC_SCENARIO.passingPath,
        SPEC_SCENARIO.waitingPath,
      ],
      waitingPaths: [
        SPEC_SCENARIO.waitingPath,
      ],
    }),
});
