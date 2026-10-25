/** `TNavigation` is the tree of every page, in the shape the site's layout renders, which the domain never reads */
export interface NavigationQueryRepository<TNavigation> {
  /** @throws {@link ExportError} when the tree cannot be read */
  readonly readNavigation: () => Promise<TNavigation>;
}
