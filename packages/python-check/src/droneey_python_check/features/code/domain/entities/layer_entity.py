from enum import StrEnum, unique


@unique
class Layer(StrEnum):
  """A folder of core's tree the check reads by its place: top-level, or a feature's layer."""

  ROOT = 'root'
  COMPOSITION = 'composition'
  FEATURES = 'features'
  KERNEL = 'kernel'
  ADAPTERS = 'adapters'
  LIBS = 'libs'
  INTEGRATIONS = 'integrations'
  ENTRYPOINTS = 'entrypoints'
  DOMAIN = 'domain'
  APP = 'app'
