import { EXECUTABLE_NAME } from '#/kernel/constants';

/** The group of commands Claude Code's hooks run. */
const HOOK_GROUP = 'hook';
/** How a line a hook writes names the command that wrote it. */
const hookPrefix = `${EXECUTABLE_NAME} ${HOOK_GROUP}`;

export { HOOK_GROUP, hookPrefix };
