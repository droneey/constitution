import { fakeImportGraph } from './import-graph.fake.ts';
import { importGraphSuite } from './import-graph.suite.ts';

importGraphSuite({
  graphOfScenario: () =>
    fakeImportGraph({
      'src/__tests__/order.test.ts': [
        'src/order.ts',
      ],
      'src/order.ts': [
        'src/price.ts',
      ],
    }),
  implementationName: 'the fake',
});
