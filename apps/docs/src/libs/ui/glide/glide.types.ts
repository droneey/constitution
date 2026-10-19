interface GlideList {
  /** rows that show a fill of their own, which the block fades out over */
  readonly filled?: string;
  /** the attribute a list sets on the row it highlights itself; without one, the pointer and the keyboard's focus decide */
  readonly marked?: string;
  readonly rows: string;
}

export type { GlideList };
