import type { NavigationQueryRepository } from '../../../contracts';

/** @throws {ExportError} when the site gives no tree in time, or none it can read */
export type GetNavigation<TNavigation> = () => Promise<TNavigation>;

export const createGetNavigation =
  <TNavigation>(navigation: NavigationQueryRepository<TNavigation>): GetNavigation<TNavigation> =>
  (): Promise<TNavigation> =>
    navigation.readNavigation();
