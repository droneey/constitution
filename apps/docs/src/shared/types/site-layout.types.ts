interface SidebarFolder {
  icon?: string;
  pages?: string[];
  title?: string;
}

interface MetaFile {
  data: SidebarFolder;
  path: string;
  type: 'meta';
}

interface SiteLayout {
  readonly documents: Readonly<Record<string, string>>;
  readonly folders: readonly MetaFile[];
  readonly glossary: string;
  readonly quickStart: string;
}

export type { MetaFile, SidebarFolder, SiteLayout };
