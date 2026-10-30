from enum import StrEnum, unique


@unique
class Layer(StrEnum):
  ROOT = 'root'
  COMPOSITION = 'composition'
  FEATURES = 'features'
  KERNEL = 'kernel'
  INFRASTRUCTURE = 'infrastructure'
  LIBS = 'libs'
  INTEGRATIONS = 'integrations'
  ENTRYPOINTS = 'entrypoints'
  DOMAIN = 'domain'
  APPLICATION = 'application'
  PRESENTATION = 'presentation'
