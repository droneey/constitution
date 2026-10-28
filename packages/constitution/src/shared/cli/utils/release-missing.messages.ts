const releaseMissingMessage = (releaseFolderPath: string): string =>
  `${releaseFolderPath} does not exist — run mise install`;

export { releaseMissingMessage };
