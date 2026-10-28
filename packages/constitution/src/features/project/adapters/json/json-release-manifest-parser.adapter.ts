import type { z } from 'zod';

import { attempted, isSyntaxError } from '#/kernel/utils';

import type { ManifestRead, ReleaseManifestParser } from '../../domain/contracts';
import { ManifestReadStatus } from '../../domain/contracts';
import { releaseManifestModel } from './models';

// The fields the problems are about; the model's fields are top-level ones, and a problem of the
// whole manifest names none.
const fieldsOf = (error: z.ZodError): readonly string[] =>
  error.issues.flatMap((issue) => {
    const [field] = issue.path;

    return field === undefined
      ? []
      : [
          String(field),
        ];
  });

const manifestReadOf = (parsed: unknown): ManifestRead => {
  const read = releaseManifestModel.safeParse(parsed);

  if (!read.success) {
    const fields = fieldsOf(read.error);

    return fields.length === 0
      ? {
          status: ManifestReadStatus.NotObject,
        }
      : {
          fields,
          status: ManifestReadStatus.Malformed,
        };
  }

  const { constitutionFormat, version } = read.data;

  return {
    manifest: {
      ...(constitutionFormat === undefined
        ? {}
        : {
            blockFormat: constitutionFormat,
          }),
      ...(version === undefined
        ? {}
        : {
            version,
          }),
    },
    status: ManifestReadStatus.Read,
  };
};

// A text that is no JSON gives no value, which is no JSON object either.
const parse = (json: string): ManifestRead =>
  manifestReadOf(
    attempted({
      effect: (): unknown => JSON.parse(json),
      isRecognised: isSyntaxError,
    }),
  );

const createJsonReleaseManifestParser = (): ReleaseManifestParser => ({
  parse,
});

export { createJsonReleaseManifestParser };
