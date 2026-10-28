import { UnitRelativePath } from '#/kernel/value-objects';

import { LineRange } from '../domain/value-objects';
import { fakeBranchReader } from './branch-reader.fake.ts';
import { BRANCH_SCENARIO, branchReaderSuite } from './branch-reader.suite.ts';

branchReaderSuite({
  implementationName: 'the fake',
  readerOfScenario: () =>
    fakeBranchReader({
      baseTexts: new Map([
        [
          UnitRelativePath.create('src/order.ts'),
          BRANCH_SCENARIO.baseOrderText,
        ],
      ]),
      changedFiles: [
        {
          filePath: UnitRelativePath.create('src/order.ts'),
          lineRanges: [
            LineRange.create({
              endLine: 1,
              startLine: 1,
            }),
          ],
        },
      ],
      newFilePaths: [
        UnitRelativePath.create('src/line.ts'),
      ],
    }),
});
