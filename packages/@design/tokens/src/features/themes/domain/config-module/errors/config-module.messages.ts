const notFoundMessage = (configPath: string): string =>
  `nothing lies at ${configPath}; give the path of the platform's configuration module from the folder the command runs in`;

const outsideWorkingFolderMessage = (configPath: string): string =>
  `${configPath} lies outside the working folder; run the command in the folder that holds the module`;

const exportsNoFunctionMessage = (configPath: string): string =>
  `${configPath} exports no function from a mode to its configuration; export one as the module's default`;

const returnsNoObjectMessage = (modeName: string): string =>
  `the configuration of the mode ${modeName} is no object; return a Style Dictionary configuration for every mode`;

export {
  exportsNoFunctionMessage,
  notFoundMessage,
  outsideWorkingFolderMessage,
  returnsNoObjectMessage,
};
