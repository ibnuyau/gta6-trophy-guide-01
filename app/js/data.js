// Loading the guide's data files: the 55 official trophies and the roadmap.
// Both are plain files under app/data/, fetched from the same server, so the
// guide works with the network off.

export async function loadGuideData() {
  const [trophiesDoc, roadmapDoc] = await Promise.all([
    fetch('data/trophies.json').then((r) => r.json()),
    fetch('data/roadmap.json').then((r) => r.json()),
  ]);
  return {
    trophies: trophiesDoc.trophies,
    counts: trophiesDoc.counts,
    roadmap: roadmapDoc.stages,
  };
}

export function trophyById(trophies) {
  return new Map(trophies.map((t) => [t.id, t]));
}

export function trophyByName(trophies) {
  return new Map(trophies.map((t) => [t.name, t]));
}

export const KIND_LABELS = {
  story: 'Story',
  side: 'Side mission',
  collectibles: 'Collectibles',
  activities: 'Activities',
  meta: 'Platinum',
  online: 'Online',
};

export const GRADE_LABELS = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};
