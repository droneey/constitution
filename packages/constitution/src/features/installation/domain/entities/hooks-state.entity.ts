enum HooksState {
  Installed = 'installed',
  Missing = 'missing',
  /** the project keeps no lefthook configuration */
  Unconfigured = 'unconfigured',
  /** lefthook is not on PATH */
  Unavailable = 'unavailable',
}

export { HooksState };
