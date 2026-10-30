import { z } from 'zod';

import { Version } from '../../../domain/value-objects';

const versionModel = z.custom<Version>(Version.is);

// Why: tolerant, since an old release's site reads the list a later release writes.
export const versionsModel = z.object({
  latest: versionModel,
  versions: z.array(versionModel).readonly(),
});
