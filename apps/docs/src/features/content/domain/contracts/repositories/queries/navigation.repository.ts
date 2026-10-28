/** `TNavigation` is the tree of every page, in the shape the site's layout renders, which the domain never reads */
export interface NavigationQueryRepository<TNavigation> {
  /** @throws {@link ExportError} when the site gives no tree in time, or none it can read */
  readonly readNavigation: () => Promise<TNavigation>;
}
