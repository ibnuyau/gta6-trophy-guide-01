// Progress storage for Leonida Ledger: localStorage only, plus export/import
// as a JSON file. Nothing is sent anywhere.

export const PROGRESS_KEY = 'leonida-ledger-progress-v1';
export const SETTINGS_KEY = 'leonida-ledger-settings-v1';

// The demo set used by ?demo=1 (13 earned trophies, a spread of story and
// free-roam ones) so screenshots can show progress without a real save.
export const DEMO_IDS = [2, 3, 8, 15, 16, 19, 20, 21, 33, 35, 44, 52, 53];

export function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return new Set();
    const names = JSON.parse(raw);
    return new Set(Array.isArray(names) ? names.filter((n) => typeof n === 'string') : []);
  } catch {
    return new Set();
  }
}

export function saveProgress(earned) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort()));
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return { spoilers: Boolean(parsed && parsed.spoilers) };
  } catch {
    return { spoilers: false };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function downloadProgress(earned) {
  const payload = {
    app: 'Leonida Ledger — GTA VI trophy guide',
    exportedAt: new Date().toISOString(),
    total: 55,
    earned: [...earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Read an imported progress file: accept either our export shape
// ({earned: [...]}) or a bare array of trophy names. Names that are not on
// the official list are ignored. Returns {earned} or {error}.
export function parseImportedProgress(text, validNames) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { error: 'That file is not valid JSON.' };
  }
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) {
    return { error: 'That file has no earned-trophy list in it.' };
  }
  const earned = new Set();
  for (const name of names) {
    if (typeof name === 'string' && validNames.has(name)) earned.add(name);
  }
  return { earned };
}

export function demoProgress(trophies) {
  const byId = new Map(trophies.map((t) => [t.id, t.name]));
  return new Set(DEMO_IDS.map((id) => byId.get(id)).filter(Boolean));
}
