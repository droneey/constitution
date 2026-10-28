import { fakeCodeComparer } from './code-comparer.fake.ts';
import { codeComparerSuite } from './code-comparer.suite.ts';

codeComparerSuite({
  comparerHolding: fakeCodeComparer,
  implementationName: 'the fake',
});
