import { PEOPLE } from '../data/people';
import { DOMAINS, LINEAGE_GROUPS, ORGS, TAGS } from '../data/taxonomy';
import type { Lab } from '../data/types';
import { spaceLabel } from './format';
import { lineageGroupsOf } from './layout';

export function searchTextForLab(lab: Lab): string {
  return [
    lab.name,
    ...(lab.priorNames ?? []),
    spaceLabel(lab),
    DOMAINS[lab.domain].label,
    ...lab.founders.map((founder) => PEOPLE[founder.person].name),
    ...lab.founders.flatMap((founder) => founder.prior?.map((org) => ORGS[org].label) ?? []),
    ...lineageGroupsOf(lab).map((group) => LINEAGE_GROUPS[group].label),
    ...(lab.tags?.map((tag) => TAGS[tag]) ?? []),
    lab.location.city,
    lab.location.country,
    lab.knownFor,
    String(lab.year),
  ]
    .join(' ')
    .toLowerCase();
}

export function matchesLabSearch(lab: Lab, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  return !normalized || searchTextForLab(lab).includes(normalized);
}
