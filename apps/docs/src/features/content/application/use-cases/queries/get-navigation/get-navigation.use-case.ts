import type { NavigationQueries } from '../../../contracts';

/** @throws {ExportError} when the site gives no tree in time, or none it can read */
export type GetNavigation<TNavigation> = () => Promise<TNavigation>;

export const createGetNavigation =
  <TNavigation>(navigationQueries: NavigationQueries<TNavigation>): GetNavigation<TNavigation> =>
  (): Promise<TNavigation> =>
    navigationQueries.readNavigation();
