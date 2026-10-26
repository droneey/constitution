import { readFileSync } from 'node:fs';

import { attempted, isSyntaxError } from '#/kernel/utils';
import { isSystemError } from '#/libs/system-error';

import type { ReleaseBuilds } from '../../domain/contracts';
import { releaseManifestModel } from './models';

interface ManifestReleaseBuildsInput {
  /** the name of the pack's JSON manifest in its folder */
  readonly manifest: string;
}

/** A manifest that is missing, unreadable or of another shape lists no build. */
const createManifestReleaseBuilds = (input: ManifestReleaseBuildsInput): ReleaseBuilds => ({
  sourcesOf: (folder: string): ReadonlyMap<string, string> => {
    const parsed = attempted<unknown>({
      // Stryker disable next-line StringLiteral: JSON reads the bytes of a file as its text
      effect: () => JSON.parse(readFileSync(`${folder}/${input.manifest}`, 'utf8')),
      // Stryker disable next-line ConditionalExpression: reading a file and parsing its text throw no other error
      isRecognised: (error: unknown): boolean => isSystemError(error) || isSyntaxError(error),
    });
    const read = releaseManifestModel.safeParse(parsed);

    return new Map(
      Object.entries((read.success ? read.data.release : undefined) ?? {}).map(([file, build]) => [
        file,
        build.from,
      ]),
    );
  },
});

export { createManifestReleaseBuilds };
