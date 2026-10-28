/**
 * a path inside `folderPath` that no file can be renamed over: written unjoined, it keeps its `..`,
 * so nothing lies at it until its folder is made, and then a folder does
 */
const unrenamablePathIn = (folderPath: string): string => `${folderPath}/theme/..`;

export { unrenamablePathIn };
