import type { UnitRelativePath } from '#/kernel/value-objects';

import type { CodeComparer } from '../application/contracts';

const fakeCodeComparer = (currentTexts: ReadonlyMap<UnitRelativePath, string>): CodeComparer => ({
  hasCodeChanged: (filePath, baseText) => baseText !== currentTexts.get(filePath),
});

export { fakeCodeComparer };
