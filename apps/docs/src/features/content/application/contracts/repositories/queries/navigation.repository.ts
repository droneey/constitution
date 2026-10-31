export interface NavigationQueryRepository<TNavigation> {
  /** @throws {ExportError} when the site gives no tree in time, or none it can read */
  readonly readNavigation: () => Promise<TNavigation>;
}
