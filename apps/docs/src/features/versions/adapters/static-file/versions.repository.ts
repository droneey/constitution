import type { VersionsQueryRepository } from '../../domain/contracts';
import type { Versions } from '../../domain/entities';
import { createVersion } from '../../domain/value-objects';
import { versionsModel } from './models';

type Transport = (
  address: string,
  init: {
    signal: AbortSignal;
  },
) => Promise<Response>;

/** reads the list at the site's root, so an old release's site learns of every later one */
export const createStaticFileVersionsRepository = (
  address: string,
  transport: Transport = fetch,
): VersionsQueryRepository => ({
  read: async (signal: AbortSignal): Promise<Versions> => {
    const response = await transport(address, {
      signal,
    });

    if (!response.ok) {
      throw new Error(`${address} answered ${response.status}`);
    }

    const file = versionsModel.parse(await response.json());

    return {
      latest: createVersion(file.latest),
      versions: file.versions.map(createVersion),
    };
  },
});
