import type { VersionsRepository } from '../../domain/contracts';
import type { Versions } from '../../domain/entities';
import { versionsModel } from './models';

/** `fetch`, or a transport that serves captured answers */
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
): VersionsRepository => ({
  read: async (signal: AbortSignal): Promise<Versions> => {
    const response = await transport(address, {
      signal,
    });

    if (!response.ok) {
      throw new Error(`${address} answered ${response.status}`);
    }

    return versionsModel.parse(await response.json());
  },
});
