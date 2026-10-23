// The files of a project and of the releases it reads, by absolute path.
interface ProjectFiles {
  // whether anything is there, a dangling link aside
  exists: (path: string) => boolean;
  // a regular file, through any link
  isFile: (path: string) => boolean;
  // a folder, through any link
  isFolder: (path: string) => boolean;
  // the regular files below a folder, from it, links to files left out; undefined when it is no folder
  listFiles: (folder: string) => readonly string[] | undefined;
  // undefined when it cannot be read
  read: (path: string) => string | undefined;
  // the folder's path with every link resolved, or undefined when it is no folder
  realFolder: (path: string) => string | undefined;
}

export type { ProjectFiles };
