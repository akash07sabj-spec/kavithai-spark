// Curated background images for kavithai posts.
// Romantic nature / love / birds — Unsplash source URLs (free to use).
export type Background = {
  id: string;
  url: string;
  label: string;
};

const raw: Array<[string, string]> = [
  ["sunset-lovers", "photo-1502082553048-f009c37129b9"],
  ["mountain-mist", "photo-1506905925346-21bda4d32df4"],
  ["cherry-blossom", "photo-1522383225653-ed111181a951"],
  ["ocean-waves", "photo-1507525428034-b723cf961d3e"],
  ["moonlit-lake", "photo-1444080748397-f442aa95c3e5"],
  ["forest-path", "photo-1441974231531-c6227db76b6e"],
  ["birds-flight", "photo-1444464666168-49d633b86797"],
  ["red-rose", "photo-1518895949257-7621c3c786d7"],
  ["golden-field", "photo-1500534314209-a25ddb2bd429"],
  ["misty-lake", "photo-1439066615861-d1af74d74000"],
  ["couple-silhouette", "photo-1518199266791-5375a83190b7"],
  ["hummingbird", "photo-1552728089-57bdde30beb3"],
  ["autumn-leaves", "photo-1507371341162-763b5e419408"],
  ["night-sky", "photo-1419242902214-272b3f66ee7a"],
  ["rain-window", "photo-1428592953211-077101b2021b"],
  ["peacock", "photo-1508669232496-137b159c1cdb"],
  ["candle-light", "photo-1478760329108-5c3ed9d495a0"],
  ["desert-dune", "photo-1509316785289-025f5b846b35"],
  ["waterfall", "photo-1432405972618-c60b0225b8f9"],
  ["swans", "photo-1516934024742-b461fba47600"],
];

export const BACKGROUNDS: Background[] = raw.map(([id, photo]) => ({
  id,
  label: id.replace(/-/g, " "),
  url: `https://images.unsplash.com/${photo}?w=1080&q=70&auto=format&fit=crop`,
}));

export function findBackground(url: string | null | undefined): Background | null {
  if (!url) return null;
  return BACKGROUNDS.find((b) => b.url === url) ?? null;
}