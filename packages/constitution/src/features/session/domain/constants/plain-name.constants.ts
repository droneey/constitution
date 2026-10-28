// Why: an id of Claude Code's names a folder or a file of the session's state, so only a plain name
// keeps it inside the sessions' folder.
const PLAIN_NAME = /^[A-Za-z0-9_-]+$/;

export { PLAIN_NAME };
