import type { Root } from 'mdast';

const dropSummary = (tree: Root): void => {
  const [first] = tree.children;

  if (first?.type !== 'blockquote') {
    return;
  }

  first.children.shift();

  if (first.children.length === 0) {
    tree.children.shift();
  }
};

// The page takes its title and summary from the file's heading and the first paragraph of its quote,
// so the body drops them and keeps what the quote says beyond.
const dropTitle = (tree: Root): void => {
  const [first] = tree.children;

  if (first?.type !== 'heading' || first.depth !== 1) {
    return;
  }

  tree.children.shift();
  dropSummary(tree);
};

const remarkDropTitle = (): ((tree: Root) => void) => dropTitle;

const remarkDropSummary = (): ((tree: Root) => void) => dropSummary;

export { dropTitle, remarkDropSummary, remarkDropTitle };
