# AGENTS.md

Single source of truth for any AI agent (or person) working in this repository.
If another instruction file disagrees with this one, this file wins.

## Project

A D&D dice roller web app with two tabs:
- **Dice Tower:** the user picks any mix of dice (d4, d6, d8, d10, d12, d20, d%), presses **Roll**,
  and the dice are thrown onto a velvet-lined dice tray where they tumble and land on their results.
  No numeric total is shown; only the dice on the board.
- **Spell Slots:** the user sets how many spell slots they have at each level (1st-9th), spends and
  recovers them by clicking gems, and restores them all with a long rest.

| Part | Tech | Location |
|---|---|---|
| Front end | Angular 22, TypeScript 6.0 (strict), signals, standalone components | repo root (`angular.json`, `src/`) |
| API | Express 5, TypeScript 6.0 (strict), ES modules | `server/` |
| Runtime | One Docker image (multi-stage, `node:24-alpine`) | `Dockerfile` |
| Images | Generated PNG die faces and a JPEG board | `src/assets/` |

There is no Python app code. Do not reintroduce Python, FastAPI or plain-JS front-end code.

## Repository layout

```
.
├── AGENTS.md           This file
├── conf/
│   └── docker-compose-template/dungeon.yaml   Runs the published image
├── Dockerfile
├── angular.json / package.json / tsconfig*.json / proxy.conf.json   Angular app (root)
├── scripts/            Asset generators (Python + Pillow). Git-ignored, not in Docker.
├── server/             Express API
│   └── src/
│       ├── main.ts
│       ├── dice/dice.ts
│       └── roll/roll-routes.ts
└── src/
    ├── index.html
    ├── main.ts
    ├── assets/         <die>/<face>.png and board/board.jpg
    └── app/
        ├── app.ts / app.html / app.css   Root component: title and the two tabs
        ├── app.config.ts
        ├── dice.ts                        Shared dice constants and helpers
        ├── dice-view/       component: the Dice Tower tab (shelf, tray, board, rolling)
        ├── dice/            dice-pool.ts (selection state)
        ├── die-button/      component
        ├── pool-tray/       component
        ├── mode-picker/     component (Normal / Advantage / Disadvantage)
        ├── dice-board/      component
        ├── rolling-die/     component (+ roll-path.ts)
        ├── rolls/           roll models and API response types
        ├── api/             dice-api.ts (HTTP service)
        ├── spell/           everything for the Spell Slots tab:
        │   ├── spellbook/       component: the tab page
        │   ├── slot-tracker/    component: slot gems, Set slots mode, Long rest
        │   └── spell-slots/     slot-store.ts (slot totals and spent slots, saved to localStorage)
        └── shared/          theme.css, base.css (global styles)
```

Keep `README.md`'s "Project structure" section in sync whenever files or folders are added,
moved or removed.

## Code organisation rules

These come directly from the project owner. Follow them from the first draft.

1. **Organise by feature, not by file type.** Each component gets its own folder
   containing that component's files and nothing else (e.g. `die-button/die-button.ts`,
   `.html`, `.css`). Components and services that belong to one feature area are grouped
   under a feature folder (e.g. `src/app/spell/` holds `spellbook/`, `slot-tracker/` and
   `spell-slots/`); new feature areas should get their own folder the same way.
2. **HTML, CSS and TypeScript are always separate files.** Use `templateUrl` and `styleUrl`.
   No inline templates, no inline `styles`, no `<style>` or `<script>` blocks in HTML.
3. **A component's styles live with that component.** Never create one big stylesheet.
   Only truly shared styling goes in `src/app/shared/` (`theme.css` for colour variables,
   `base.css` for page-wide defaults and utilities such as `.sr-only`).
4. **Shared resources go in a `shared/` directory**, not scattered across features.
5. **One class per file**, named after the class in kebab-case (`DicePool` → `dice-pool.ts`).
   Non-UI groups get their own folders too (`dice/`, `rolls/`, `api/`).
6. **No mega-files split by section comments.** If you are tempted to write
   `// ---------- Something ----------`, that "something" belongs in its own file.
7. **Prefer OOP and reactive state over procedural loops.** Classes own their state and
   rendering; use Angular signals (`signal`, `computed`, `input`, `output`) so components
   update themselves. Avoid central functions that loop over everything to re-render.
   Prefer `map` / `filter` / `flatMap` / `reduce` over hand-written `for` loops.
8. **Generic entry files sit at the top of `src/app/`** (`app.*`, `app.config.ts`, `dice.ts`).

### CSS formatting

One declaration per line, selector and `{` on the first line, `}` on its own line:

```css
#detail {
    min-height: 1.5rem;
    color: var(--muted);
}
```

Never write compact one-line rules such as `#detail { color: var(--muted); min-height: 1.5rem; }`.
Use the colour variables from `shared/theme.css` instead of hard-coded colours.

### Visual theme

The UI is themed as a torch-lit D&D table: dungeon-stone background, leather dice shelf,
parchment scroll for the selection, crimson buttons with gold trim, wax-seal badges, and a
velvet-lined wooden dice tray with brass corners (`src/assets/board/board.jpg`).

- All colors and fonts come from variables in `shared/theme.css`; add new ones there.
- Fonts are bundled with `@fontsource/*` packages (registered in `angular.json` `styles`),
  never loaded from an external CDN.
  - `--font-title` (Cinzel Decorative): the main heading only.
  - `--font-heading` (Cinzel): labels and buttons. It is all-caps and its "1" looks like "I",
    so **never use it for numbers**.
  - `--font-body` (IM Fell English): flavour text and messages.
  - `--font-numbers` (Libre Baskerville): anything showing digits, such as dice notation or badges.
- Flavour text may use light old-style wording ("Choose thy dice…"), but controls and
  numbers must stay plain and unambiguous.

### TypeScript style

- Strict mode is on in both projects; keep it on and keep the build free of errors.
- 4-space indentation, double quotes, trailing commas in multi-line literals.
- Angular 20+ file naming: `die-button.ts`, not `die-button.component.ts`.
- Use `inject()` rather than constructor injection; `protected` for template-only members.
- Server imports use the `.js` extension (NodeNext ES modules).

## Domain rules

- Supported dice: `d4, d6, d8, d10, d12, d20, d100` (d100 is shown as **d%**). Max 20 dice per roll.
- Rolls happen on the server with `node:crypto` `randomInt` (fair and unpredictable),
  never with `Math.random()`. `Math.random()` is fine for visuals only (tumbling faces, positions).
- **d%** is rolled like the physical pair: a tens die (`00`–`90`) plus a d10 ones die (`0`–`9`);
  `00` + `0` counts as 100. The board shows both dice.
- Image names: `src/assets/<die>/<face>.png`. A d10 roll of 10 uses `d10/10.png` (shows "10");
  `d10/0.png` (shows "0") is only for the ones digit of a d% roll. d% faces are `00.png`–`90.png`.
- The dice selection **resets after every successful roll**; it is kept if the roll fails.
- **Advantage / disadvantage** apply to d20s only (as in 5e): each d20 is rolled twice on the
  server and the higher / lower result is kept. Other dice in the same roll are unaffected.
  The mode can only be chosen while a d20 is selected and resets to normal with the selection.
  Both d20s land on the board; the discarded one fades and greys out after landing.
- A natural 20 / natural 1 on a kept d20 glows green / orange on the board (discarded dice never glow).
- Respect `prefers-reduced-motion`: dice are placed without animation.
- Results are announced to screen readers via a visually hidden live region.

### Spell slots

- The tracker is deliberately **not character-aware**: no classes, levels or rules lookups.
  The player sets their own slot totals per level (0-9 each) in "Set slots" mode.
- Clicking an available gem spends a slot; clicking a spent gem recovers one. **Long rest**
  restores every slot. Lowering a total below the spent count caps the spent count.
- State lives only in the browser (`localStorage`, key `dice-tower.spell-slots.v1`); there is no
  server API for it.
- Both tabs stay mounted and are hidden with `[hidden]` (see `shared/base.css`), so dice on the
  board survive switching tabs.

### API

```
GET /api/roll?dice=d20&dice=d4[&mode=advantage|disadvantage]
                                   -> { rolls: [{ die, value, tens?, ones?, mode?, discarded? }], total }
GET /api/roll/{die}?count=N[&mode=...]
                                   -> { die, rolls, total }
GET /healthz                       -> { status: "ok" }
```

`mode` is optional (default `normal`); `mode` and `discarded` appear only on d20s rolled with
advantage / disadvantage, and `total` uses the kept values.
Unknown dice return 404; wrong counts or an unknown `mode` return 422; all as `{ detail: "<message>" }`.
The response shape is mirrored in `src/app/rolls/roll-response.ts`; change both together.

## Assets

Images are generated, not hand-drawn. To change them, edit and re-run the scripts
(they write straight into `src/assets/`):

```
pip install -r scripts/requirements-dev.txt
python scripts/generate_dice_assets.py
python scripts/generate_board_asset.py
```

Commit the generated images; `scripts/` itself is git-ignored by the owner's choice.

## Commands

Requires Node.js 24 LTS (or 22.22+). Angular 22 needs TypeScript `~6.0` (not 7).

```
# API (terminal 1)
cd server && npm install && npm run dev       # http://localhost:8000

# App (terminal 2, project root)
npm install && npm start                      # http://localhost:4200, proxies /api to :8000

# Production image from source
docker build -t dice-roller .
docker run --rm --name dnd -p 8080:8000 dice-roller

# Published image (what friends use; only dungeon.yaml is needed)
docker compose -f conf/docker-compose-template/dungeon.yaml up -d dungeon
docker stop dnd
docker start dnd
```

### Versioning and releases

Semantic Versioning, starting at **1.0.0**. MAJOR for breaking changes (e.g. a changed API or
compose file that existing users must adapt to), MINOR for new features, PATCH for fixes.

Releasing version X.Y.Z (only when the owner asks):
1. Set `"version": "X.Y.Z"` in `package.json`, `server/package.json` and both lockfiles.
2. Set the default image tag in `conf/docker-compose-template/dungeon.yaml` (`${TAG:-X.Y.Z}`).
3. Add an `## [X.Y.Z] - YYYY-MM-DD` entry to `CHANGELOG.md` (plus its link at the bottom).
4. Commit on a branch named exactly `X.Y.Z` (no `v` prefix) and push it:
   `git switch -c X.Y.Z` then `git push -u origin X.Y.Z`.
   Pushing the branch publishes image tags `X.Y.Z`, `X.Y` and `X`.

Treat a pushed version branch as frozen: every push to it republishes `X.Y.Z`, so fixes go into
a new PATCH branch (e.g. `1.0.1`) instead of changing a released one.

### Publishing

`.github/workflows/publish-image.yml` builds on every push to `main` and to version branches,
and publishes `ghcr.io/millermatt090/dnd` for `linux/amd64` and `linux/arm64`.
Pushes to `main` update `latest`; pushes to a version branch (named `X.Y.Z`, e.g. `1.0.0`)
publish image tags `X.Y.Z`, `X.Y` and `X`.
The Dockerfile's build stages use `--platform=$BUILDPLATFORM` so only the copy-only runtime
stage is built per architecture. This only works while the server's dependencies are pure
JavaScript: if a native module is ever added, remove `--platform=$BUILDPLATFORM` from the
server stage. `conf/docker-compose-template/dungeon.yaml` must keep working on its own, with no source code
present (image only, no `build:`).

The container is always named **`dnd`** (the Compose project and service are named `dungeon`)
and is opened in the browser on host port **8080**. Inside the container (and in local dev) the
server listens on **8000**; only the host side of the mapping is 8080. The server handles
SIGTERM/SIGINT so `docker stop` is instant;
keep that handler.
If port 8080 is taken by the owner's running container, test on another port
(e.g. `-p 8081:8000`) instead of stopping theirs.

## Verifying changes

Do not report work as done until it has been checked:

1. `docker build` succeeds (this runs the strict TypeScript and Angular template checks).
2. Run the container and hit the affected endpoints / assets with `curl`.
3. For UI changes, load the page in a real (headless) browser and exercise the feature;
   check there are no JavaScript errors. Take a screenshot for visual changes.

State plainly what was and wasn't verified.

## Environment notes

- The repo lives in a OneDrive folder. Right after moving files, `docker build` can fail with
  `invalid file request`; wait a moment and retry.
- Do not install `node_modules` into the OneDrive folder from automation; to regenerate a
  lockfile without Node locally, use
  `docker run --rm -v "<dir>:/w" -w /w node:24-alpine npm install --package-lock-only --ignore-scripts`.
- In Git Bash, Docker Desktop's helper folder may be missing from `PATH`
  (`docker-credential-desktop` not found); prepend `C:\Program Files\Docker\Docker\resources\bin`.

## Security and repository hygiene

- Never commit secrets. Keep any future keys in environment variables or a `.env` file
  (add `.env` to `.gitignore` before creating one).
- Never commit `node_modules/`, `dist/`, `out-tsc/` or `.angular/` (already git-ignored).
- The app needs no API keys or outside services; keep it that way unless asked.
