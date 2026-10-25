import type { NavigationQueryRepository } from '../../../contracts';

export type GetNavigation<TNavigation> = () => Promise<TNavigation>;

export const createGetNavigation =
  <TNavigation>(navigation: NavigationQueryRepository<TNavigation>): GetNavigation<TNavigation> =>
  (): Promise<TNavigation> =>
    navigation.readNavigation();
