import type { ConfigOfMode } from '../types';

/** Tells whether a module's export is a function; its parameters cannot be read, and Style Dictionary checks each configuration it returns. */
const isConfigOfMode = (raw: unknown): raw is ConfigOfMode => typeof raw === 'function';

export { isConfigOfMode };
