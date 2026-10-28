interface GlideList {
  /** the block fades out over these rows */
  readonly filledRowSelector?: string;
  /** the attribute a list sets on the row it highlights itself; without one, the pointer and the keyboard's focus decide */
  readonly markAttribute?: string;
  readonly rowSelector: string;
}

/** keyed by the selector that finds the list */
type GlideLists = Readonly<Record<string, GlideList>>;

export type { GlideList, GlideLists };
