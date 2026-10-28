// Why: written unjoined, the path keeps its `..`, so nothing lies at it until its folder is made,
// and then a folder does, which no file can be renamed over.
const unrenamablePathIn = (folderPath: string): string => `${folderPath}/theme/..`;

export { unrenamablePathIn };
