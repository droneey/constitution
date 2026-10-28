from enum import StrEnum, unique


@unique
class Layer(StrEnum):
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
