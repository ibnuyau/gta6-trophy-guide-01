// Rendering: the checklist rows, the trophy detail card, the roadmap stages
// and the missables list. These functions only build DOM; app.js owns state.

import { GRADE_LABELS, KIND_LABELS } from './data.js';

// A trophy's name and description are spoilers when the spoiler setting is
// on, the trophy is a story trophy, and it has not been earned yet.
export function isSpoilered(trophy, earned, spoilersOn) {
  return spoilersOn && trophy.kind === 'story' && !earned.has(trophy.name);
}

export function medalElement(grade, large) {
  const span = document.createElement('span');
  span.className = 'medal ' + grade + (large ? ' lg' : '');
  span.title = GRADE_LABELS[grade];
  return span;
}

function tagElement(text, extraClass) {
  const tag = document.createElement('span');
  tag.className = 'tag' + (extraClass ? ' ' + extraClass : '');
  tag.textContent = text;
  return tag;
}

export function trophyRow(trophy, state, callbacks) {
  const { earned, spoilers, selectedId } = state;
  const li = document.createElement('li');
  const isEarned = earned.has(trophy.name);
  li.className = (isEarned ? 'earned' : '') + (selectedId === trophy.id ? ' selected' : '');
  li.dataset.trophyId = String(trophy.id);

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = isEarned;
  box.setAttribute('aria-label', 'Earned: ' + trophy.name);
  box.addEventListener('change', () => callbacks.onToggle(trophy));
  box.addEventListener('click', (event) => event.stopPropagation());
  li.append(box);
  li.append(medalElement(trophy.grade, false));

  const body = document.createElement('div');
  body.className = 'trophy-body';
  const title = document.createElement('h3');
  const desc = document.createElement('p');
  desc.className = 'desc';
  if (isSpoilered(trophy, earned, spoilers)) {
    title.textContent = 'Hidden story trophy';
    title.classList.add('spoilered');
    desc.textContent = 'Earn this trophy to reveal its name and description.';
    desc.classList.add('spoilered');
  } else {
    title.textContent = trophy.name;
    desc.textContent = trophy.description;
  }
  body.append(title, desc);

  const tags = document.createElement('div');
  tags.className = 'tags';
  tags.append(tagElement(GRADE_LABELS[trophy.grade]));
  if (trophy.kind !== 'meta') tags.append(tagElement(KIND_LABELS[trophy.kind] || trophy.kind));
  if (trophy.hidden) tags.append(tagElement('Hidden on PSN', 'hidden-tag'));
  if (trophy.missable) tags.append(tagElement('Missable', 'missable'));
  if (trophy.target) tags.append(tagElement('Target: ' + trophy.target));
  body.append(tags);
  li.append(body);

  li.addEventListener('click', () => callbacks.onSelect(trophy));
  return li;
}

export function renderTrophyList(listElement, emptyElement, trophies, state, callbacks) {
  listElement.replaceChildren();
  for (const trophy of trophies) {
    listElement.append(trophyRow(trophy, state, callbacks));
  }
  emptyElement.hidden = trophies.length > 0;
}

export function renderDetail(detail, trophy, earned, spoilersOn, callbacks) {
  const card = detail.card;
  const empty = detail.empty;
  if (!trophy) {
    card.hidden = true;
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  card.hidden = false;
  const medalSlot = detail.medal;
  medalSlot.replaceChildren(medalElement(trophy.grade, true));
  const spoilered = isSpoilered(trophy, earned, spoilersOn);
  detail.name.textContent = spoilered ? 'Hidden story trophy' : trophy.name;
  detail.desc.textContent = spoilered
    ? 'Earn this trophy to reveal its name and description.'
    : trophy.description;
  const bits = [GRADE_LABELS[trophy.grade]];
  if (trophy.kind !== 'meta') bits.push(KIND_LABELS[trophy.kind] || trophy.kind);
  if (trophy.hidden) bits.push('Hidden on PlayStation until earned');
  if (trophy.missable) bits.push('Missable — see the guide');
  if (trophy.target) bits.push('PlayStation tracks a count: ' + trophy.target);
  detail.meta.textContent = bits.join(' · ');
  detail.guide.textContent = spoilered
    ? 'The guide stays hidden with the trophy. Earn it first — or turn the spoiler setting off.'
    : trophy.guide;
  detail.sources.replaceChildren();
  if (spoilered) {
    const li = document.createElement('li');
    li.textContent = 'Sources are hidden with the trophy.';
    detail.sources.append(li);
  } else {
    for (const source of trophy.sources || []) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = source.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = source.name;
      li.append(a);
      detail.sources.append(li);
    }
  }
  const isEarned = earned.has(trophy.name);
  detail.toggle.textContent = isEarned ? 'Mark as not earned' : 'Mark as earned';
  detail.toggle.classList.toggle('earned', isEarned);
  detail.toggle.onclick = () => callbacks.onToggle(trophy);
}

export function renderRoadmap(stagesElement, stages, byId, earned) {
  stagesElement.replaceChildren();
  for (const stage of stages) {
    const li = document.createElement('li');
    const heading = document.createElement('h3');
    heading.textContent = stage.title;
    if (stage.when) {
      const when = document.createElement('span');
      when.className = 'when';
      when.textContent = ' — ' + stage.when;
      heading.append(when);
    }
    li.append(heading);
    const note = document.createElement('p');
    note.textContent = stage.note;
    li.append(note);
    const done = stage.ids.filter((id) => earned.has(byId.get(id).name)).length;
    const count = document.createElement('p');
    count.className = 'stage-count';
    count.textContent = done + ' of ' + stage.ids.length + ' earned in this stage';
    li.append(count);
    const pills = document.createElement('div');
    pills.className = 'stage-trophies';
    for (const id of stage.ids) {
      const trophy = byId.get(id);
      const pill = document.createElement('span');
      pill.className = 'pill' + (earned.has(trophy.name) ? ' done' : '');
      pill.textContent = trophy.name;
      pills.append(pill);
    }
    li.append(pills);
    stagesElement.append(li);
  }
}
