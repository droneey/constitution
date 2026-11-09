import type { z } from 'zod';

import { attempted, isSyntaxError } from '#/kernel/utils';

import type { ManifestRead, ReleaseManifestParser } from '../../application/contracts';
import { ManifestReadStatus } from '../../application/contracts';
import { releaseManifestModel } from './models';

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
