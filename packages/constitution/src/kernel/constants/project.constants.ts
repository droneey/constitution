// The file a project and each member of its workspace declare their blocks in, and its key that
// names the one check of the whole tree, which only the repository's file holds.
const CONFIG_FILE = 'constitution.yaml';
const CHECK_KEY = 'check';

// Where a project links the release it pins, from its folder.
const RELEASE_FOLDER = '.droneey/constitution';

export { CHECK_KEY, CONFIG_FILE, RELEASE_FOLDER };
