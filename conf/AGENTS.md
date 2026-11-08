# AGENTS.md

Single source of truth for any AI agent (or person) working in this repository.
If another instruction file disagrees with this one, this file wins.

## Project

A D&D dice roller web app. The user picks any mix of dice (d4, d6, d8, d10, d12, d20, d%),
presses **Roll**, and the dice are thrown onto a velvet-lined dice tray where they tumble and land on
their results. No numeric total is shown; only the dice on the board.

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
├── conf/AGENTS.md      This file
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
        ├── app.ts / app.html / app.css   Root component
        ├── app.config.ts
        ├── dice.ts                        Shared dice constants and helpers
        ├── dice/            dice-pool.ts (selection state)
        ├── die-button/      component
        ├── pool-tray/       component
        ├── dice-board/      component
        ├── rolling-die/     component (+ roll-path.ts)
        ├── rolls/           roll models and API response types
        ├── api/             dice-api.ts (HTTP service)
        └── shared/          theme.css, base.css (global styles)
```

Keep `README.md`'s "Project structure" section in sync whenever files or folders are added,
moved or removed.

## Code organisation rules

These come directly from the project owner. Follow them from the first draft.

1. **Organise by feature, not by file type.** Each component gets its own folder under
   `src/app/` containing that component's files and nothing else
   (e.g. `die-button/die-button.ts`, `.html`, `.css`).
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

- All colours and fonts come from variables in `shared/theme.css`; add new ones there.
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
- A natural 20 / natural 1 on a d20 glows green / red on the board.
- Respect `prefers-reduced-motion`: dice are placed without animation.
- Results are announced to screen readers via a visually hidden live region.

### API

```
GET /api/roll?dice=d20&dice=d4     -> { rolls: [{ die, value, tens?, ones? }], total }
GET /api/roll/{die}?count=N        -> { die, rolls, total }
GET /healthz                       -> { status: "ok" }
```

Unknown dice return 404, wrong counts return 422, both as `{ detail: "<message>" }`.
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

# Production image
docker build -t dice-roller .
docker run --rm --name dungeons -p 8000:8000 dice-roller
```

The container is always named **`dungeons`** and listens on port **8000**.
If port 8000 is taken by the owner's running container, test on another port
(e.g. `-p 8001:8000`) instead of stopping theirs.

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
