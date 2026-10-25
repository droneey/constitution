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

export type { MetaFile, SidebarFolder };
