// A session's or an agent's id names a folder or a file of the session's state only when it is a
// plain name, so no id reaches outside it.
const PLAIN_NAME = /^[A-Za-z0-9_-]+$/;

const isPlainName = (name: string): boolean => PLAIN_NAME.test(name);

export { isPlainName };
