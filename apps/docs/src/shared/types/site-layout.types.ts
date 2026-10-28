/** a folder of the sidebar, as Fumadocs' loader reads it from a `meta.json` */
interface SidebarFolder {
  icon?: string;
  pages?: string[];
  title?: string;
}

/** a `meta.json` the site adds to the guide's folders, which the repository has no file for */
interface MetaFile {
  data: SidebarFolder;
  path: string;
  type: 'meta';
}

/** what the site serves beside the guide's own files, as the repository lays it out */
interface SiteLayout {
  /** the site's name of each document of the repository's root, by its file */
  readonly documents: Readonly<Record<string, string>>;
  /** the guide's sidebar and every folder of blocks */
  readonly folders: readonly MetaFile[];
  readonly glossary: string;
  readonly quickStart: string;
}

export type { MetaFile, SidebarFolder, SiteLayout };
