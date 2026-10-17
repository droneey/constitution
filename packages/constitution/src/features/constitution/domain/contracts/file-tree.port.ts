interface FileTree {
  list: () => readonly string[];
  read: (path: string) => string;
}

export type { FileTree };
