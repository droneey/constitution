/**
 * The key of an entry's rule or language that holds for every rule of its block, or every language.
 */
const EVERY = '*';

const LOCK_FILE_NAME = 'constitution.lock';

const PRESET_FILE_EXTENSION = '.yaml';
const PLUGINS_FOLDER_NAME = 'plugins';

/** A preset file's path names at most two blocks beyond its reader: those its entries need. */
const MAX_WITHS = 2;

export { EVERY, LOCK_FILE_NAME, MAX_WITHS, PLUGINS_FOLDER_NAME, PRESET_FILE_EXTENSION };
