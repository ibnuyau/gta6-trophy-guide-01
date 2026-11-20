# Leonida Ledger — GTA VI Trophy Guide & Tracker

An offline, open-source guide and tracker for the 55 PlayStation 5
trophies of Grand Theft Auto VI. Built for the make.fun bounty
`gta6-trophy-guide-01`.

## What it is

- **Every trophy, official text.** All 55 trophies — 1 platinum, 2 gold,
  6 silver, 46 bronze, 28 hidden on PlayStation until earned — each with
  its official name, description and grade as PlayStation publishes them.
- **A guide for each, in our own words, with sources.** Every guide names
  the sources its facts come from (a link beside the guide). Nothing is
  copied from another guide: a source is cited, never copied.
- **A tracker.** Tick trophies off; progress is saved in the browser
  (localStorage), exportable to a JSON file and importable back.
- **Filters.** By kind (story, side missions, collectibles, activities,
  missable, online) and by grade, plus search. There are no online
  trophies — all 55 are offline single-player — so the online filter is
  empty on purpose, and says so.
- **Spoiler setting.** With spoilers hidden, story trophies you have not
  earned yet show neither name nor description until you earn them.
- **Roadmap to the platinum.** Seven stages in earning order, built from
  the official descriptions: which story chapters and missions, which
  collectibles and counts. Around 200 hours at a 4-out-of-10 difficulty,
  one playthrough.
- **Missables.** One trophy is flagged missable — Positive Mental
  Attitude, whose Chapter 1 meditation can be lost — because it is the
  only one the published guides flag that way. Everything else stays
  available after the credits.

## Run it

Static files, no build step, no network. Serve `app/` with any static
server and open `index.html` in desktop Chrome:

```sh
python3 -m http.server --directory app 8080
# open http://localhost:8080
```

Screenshot helpers (used to take the entry's screenshots, not needed for
normal use): `?demo=1` seeds 13 earned trophies on a fresh browser,
`?view=roadmap|missables|about` opens a section directly,
`?spoilers=on` turns the spoiler setting on, `?trophy=28` opens one
trophy's guide.

## Sources

- Exophase — Grand Theft Auto VI trophies (PS5): official names,
  descriptions and grades
  <https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/>
- PSNProfiles — Grand Theft Auto VI trophies: grades and PlayStation's
  progress counts
  <https://psnprofiles.com/trophies/43531-grand-theft-auto-vi>
- Output Lag — GTA 6 trophy list: saves, robberies, meditation, ranges
  <https://outputlag.com/guides/gta-6-trophy-list/>
- EGamers.io — GTA 6 trophy list and hardest trophies: overview and
  estimates
  <https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/>
- GTAScoop — GTA 6 trophies & achievements: story structure
  <https://gtascoop.com/guides/gta-6-trophies-achievements/>

## Honesty note

The game released on 19 November 2026. These guides are built from the
official trophy descriptions and the published guides above; they have not
been checked in the game by us. Where a detail is unconfirmed, the guide
says so rather than inventing a step.

## Handing it in

`main.ts` (Node 22, standard library only) copies `app/` and
`screenshots/` to `/output` and writes `/output/dossier.json` with the
vendored `vendor/makefun-frontend.ts` library, unchanged from the kit:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see `LICENSE`. An unofficial fan guide, not affiliated with or
endorsed by Rockstar Games. No Rockstar logo or official artwork is used.
