import type { RuleFormDetails, ValueFindingDetails } from '#/kernel/entities';
import type { FindingOf } from '#/kernel/types';

import type { LoadFindingDetails } from '../../../constitution/entities';
import type { ManifestReadDetails } from '../../../manifest/entities';
import type {
  BlockFormDetails,
  BudgetDetails,
  CoreChaptersDetails,
  CyclesDetails,
  DecisionsDetails,
  FrontMatterDetails,
  HooksDetails,
  LinksDetails,
  MarketplaceDetails,
  NamesDetails,
  PluginDetails,
  ReferencesDetails,
  RequiresDetails,
  RulesDetails,
  SeamsDetails,
  TermsDetails,
  WordingDetails,
} from './checks';

type BlockFindingDetails = BlockFormDetails &
  BudgetDetails &
  CoreChaptersDetails &
  CyclesDetails &
  DecisionsDetails &
  FrontMatterDetails &
  HooksDetails &
  LinksDetails &
  LoadFindingDetails &
  ManifestReadDetails &
  MarketplaceDetails &
  NamesDetails &
  PluginDetails &
  ReferencesDetails &
  RequiresDetails &
  RuleFormDetails &
  RulesDetails &
  SeamsDetails &
  TermsDetails &
  ValueFindingDetails &
  WordingDetails;

type BlockFindingCode = keyof BlockFindingDetails & string;

type BlockFinding = FindingOf<BlockFindingDetails>;

export type { BlockFinding, BlockFindingCode, BlockFindingDetails };
