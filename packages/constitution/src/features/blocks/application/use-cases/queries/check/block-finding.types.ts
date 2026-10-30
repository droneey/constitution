import type {
  RequirementsTableDetails,
  RuleFormDetails,
  ValueFindingDetails,
} from '#/kernel/entities';
import type { FindingOf } from '#/kernel/types';

import type {
  AbstractBlocksDetails,
  BlockFormDetails,
  BudgetDetails,
  ConfigurationLanguagesDetails,
  CoreChaptersDetails,
  CorePartDetails,
  CyclesDetails,
  DecisionsDetails,
  FrontMatterDetails,
  HooksDetails,
  LinksDetails,
  MarketplaceDetails,
  PluginDetails,
  ReferencesDetails,
  RequirementsDetails,
  RequiresDetails,
  RulesDetails,
  SeamsDetails,
  TermsDetails,
} from './checks';
import type { LoadFindingDetails } from './steps/load-constitution';
import type { ManifestReadDetails } from './utils';

type BlockFindingDetails = AbstractBlocksDetails &
  BlockFormDetails &
  BudgetDetails &
  ConfigurationLanguagesDetails &
  CoreChaptersDetails &
  CorePartDetails &
  CyclesDetails &
  DecisionsDetails &
  FrontMatterDetails &
  HooksDetails &
  LinksDetails &
  LoadFindingDetails &
  ManifestReadDetails &
  MarketplaceDetails &
  PluginDetails &
  ReferencesDetails &
  RequirementsDetails &
  RequirementsTableDetails &
  RequiresDetails &
  RuleFormDetails &
  RulesDetails &
  SeamsDetails &
  TermsDetails &
  ValueFindingDetails;

type BlockFindingCode = keyof BlockFindingDetails & string;

type BlockFinding = FindingOf<BlockFindingDetails>;

export type { BlockFinding, BlockFindingCode, BlockFindingDetails };
