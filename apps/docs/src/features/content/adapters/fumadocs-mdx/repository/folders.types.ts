/** a folder of the sidebar, as the library reads it from a `meta.json` */
interface SidebarFolder {
  icon?: string;
  pages?: string[];
  title?: string;
}

/** a `meta.json` the site adds to the library's source, which the repository has no file for */
interface MetaFile {
  data: SidebarFolder;
  path: string;
  type: 'meta';
}

/** what the site's loader serves beside the guide's own files */
interface SiteLayout {
  /** the site's name of each document of the repository's root, by its file */
  readonly documents: Readonly<Record<string, string>>;
  readonly folders: readonly MetaFile[];
  readonly glossary: string;
  readonly quickStart: string;
}

export type { MetaFile, SidebarFolder, SiteLayout };
