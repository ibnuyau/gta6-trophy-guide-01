// Leonida Ledger boot: state, filters, spoiler setting, tabs, export/import.
// Progress lives in localStorage; the guide itself is static files only.

import { loadGuideData, trophyById, trophyByName } from './data.js';
import {
  PROGRESS_KEY,
  demoProgress,
  downloadProgress,
  loadProgress,
  loadSettings,
  parseImportedProgress,
  saveProgress,
  saveSettings,
} from './store.js';
import { renderDetail, renderRoadmap, renderTrophyList } from './views.js';

const state = {
  trophies: [],
  byId: new Map(),
  byName: new Map(),
  roadmap: [],
  earned: new Set(),
  view: 'checklist',
  kind: 'all',
  grade: 'all',
  query: '',
  spoilers: false,
  selectedId: null,
};

const $ = (id) => document.getElementById(id);

function visibleTrophies() {
  const q = state.query.trim().toLowerCase();
  return state.trophies.filter((t) => {
    if (state.kind === 'missable' && !t.missable) return false;
    if (state.kind === 'online') return false;
    if (state.kind !== 'all' && state.kind !== 'missable' && t.kind !== state.kind) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderProgress() {
  const total = state.trophies.length;
  const earned = state.earned.size;
  $('progressText').textContent = earned + ' of ' + total + ' earned';
  $('progressPct').textContent = total ? Math.round((earned / total) * 100) + '%' : '0%';
  $('progressBar').style.width = (total ? (earned / total) * 100 : 0) + '%';
  const grades = ['platinum', 'gold', 'silver', 'bronze'];
  $('gradeCounts').textContent = grades
    .map((g) => {
      const have = state.trophies.filter((t) => t.grade === g && state.earned.has(t.name)).length;
      const all = state.trophies.filter((t) => t.grade === g).length;
      return g + ' ' + have + '/' + all;
    })
    .join(' · ');
}

function renderAll() {
  renderProgress();
  const visible = visibleTrophies();
  renderTrophyList($('trophyList'), $('listEmpty'), visible, state, {
    onToggle: toggleTrophy,
    onSelect: selectTrophy,
  });
  $('listHint').textContent =
    state.kind === 'online'
      ? 'No online trophies: all 55 are offline single-player, so this filter is empty on purpose.'
      : 'Showing ' + visible.length + ' of ' + state.trophies.length + ' trophies. Tick a trophy to mark it earned — it stays ticked in this browser.';
  const missables = state.trophies.filter((t) => t.missable);
  renderTrophyList($('missableList'), $('listEmpty'), missables, state, {
    onToggle: toggleTrophy,
    onSelect: selectTrophy,
  });
  renderRoadmap($('roadmapStages'), state.roadmap, state.byId, state.earned);
  renderDetail(
    {
      card: $('detailCard'),
      empty: $('detailEmpty'),
      medal: $('detailMedal'),
      name: $('detailName'),
      desc: $('detailDesc'),
      meta: $('detailMeta'),
      guide: $('detailGuide'),
      sources: $('detailSources'),
      toggle: $('detailToggle'),
    },
    state.selectedId ? state.byId.get(state.selectedId) : null,
    state.earned,
    state.spoilers,
    { onToggle: toggleTrophy },
  );
}

function setView(view) {
  state.view = view;
  for (const button of document.querySelectorAll('#tabs button')) {
    button.classList.toggle('active', button.dataset.view === view);
  }
  for (const name of ['checklist', 'roadmap', 'missables', 'about']) {
    $('view-' + name).hidden = name !== view;
  }
  $('toolbar').style.display = view === 'checklist' ? '' : 'none';
}

function toggleTrophy(trophy) {
  if (state.earned.has(trophy.name)) state.earned.delete(trophy.name);
  else state.earned.add(trophy.name);
  saveProgress(state.earned);
  renderAll();
}

function selectTrophy(trophy) {
  state.selectedId = trophy.id;
  renderAll();
  if (window.innerWidth <= 900) {
    $('detailPane').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function applyUrlParams() {
  const params = new URLSearchParams(location.search);
  const view = params.get('view');
  if (['checklist', 'roadmap', 'missables', 'about'].includes(view)) state.view = view;
  if (params.get('spoilers') === 'on') state.spoilers = true;
  if (params.get('demo') === '1' && !localStorage.getItem(PROGRESS_KEY)) {
    state.earned = demoProgress(state.trophies);
    saveProgress(state.earned);
  }
  const demoTrophy = Number(params.get('trophy'));
  if (demoTrophy && state.byId.has(demoTrophy)) state.selectedId = demoTrophy;
  if (!state.selectedId && state.view === 'checklist') {
    // Open the missable trophy's guide by default: it is the one guide
    // every reader needs before playing.
    const missable = state.trophies.find((t) => t.missable);
    if (missable) state.selectedId = missable.id;
  }
}

async function initGuide() {
  const data = await loadGuideData();
  state.trophies = data.trophies;
  state.byId = trophyById(data.trophies);
  state.byName = trophyByName(data.trophies);
  state.roadmap = data.roadmap;
  state.earned = loadProgress();
  state.spoilers = loadSettings().spoilers;
  applyUrlParams();

  $('spoilerToggle').checked = state.spoilers;
  $('spoilerToggle').addEventListener('change', (event) => {
    state.spoilers = event.target.checked;
    saveSettings({ spoilers: state.spoilers });
    renderAll();
  });
  $('search').addEventListener('input', (event) => {
    state.query = event.target.value;
    renderAll();
  });
  $('gradeFilter').addEventListener('change', (event) => {
    state.grade = event.target.value;
    renderAll();
  });
  for (const chip of document.querySelectorAll('#kindChips button')) {
    chip.addEventListener('click', () => {
      state.kind = chip.dataset.kind;
      for (const other of document.querySelectorAll('#kindChips button')) {
        other.classList.toggle('active', other === chip);
      }
      renderAll();
    });
  }
  for (const button of document.querySelectorAll('#tabs button')) {
    button.addEventListener('click', () => setView(button.dataset.view));
  }
  $('exportBtn').addEventListener('click', () => downloadProgress(state.earned));
  $('importFile').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const result = parseImportedProgress(await file.text(), state.byName);
    if (result.error) {
      alert(result.error);
    } else {
      state.earned = result.earned;
      saveProgress(state.earned);
      renderAll();
    }
    event.target.value = '';
  });
  $('resetBtn').addEventListener('click', () => {
    if (confirm('Clear all earned trophies in this browser?')) {
      state.earned = new Set();
      saveProgress(state.earned);
      renderAll();
    }
  });

  setView(state.view);
  renderAll();
}

initGuide().catch((error) => {
  document.getElementById('listHint').textContent =
    'Could not load the trophy data. Open this guide from its own files (serve app/ with any static server) and try again. (' + error.message + ')';
});
