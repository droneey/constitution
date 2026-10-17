enum DocumentPath {
  Decisions = 'DECISIONS.md',
  Hooks = 'hooks/hooks.json',
  Marketplace = '.claude-plugin/marketplace.json',
  Plugin = '.claude-plugin/plugin.json',
  Readme = 'README.md',
  Vocabulary = 'vocabulary.yaml',
}

// Where the blocks of the constitution a pack extends sit in the paths the
// checks report, apart from the pack's own.
const BASE_PREFIX = '(base)/';

export { BASE_PREFIX, DocumentPath };
