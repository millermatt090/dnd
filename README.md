# Dice Roller

A web dice roller for D&D: d4, d6, d8, d10, d12, d20 and d% (percentile), with
advantage / disadvantage and a spell slot tracker.
Built with an Angular + TypeScript front end and a TypeScript (Express) API.

## Quick start (no code needed)
1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and start it.
2. Download [`dungeon.yaml`](conf/docker-compose-template/dungeon.yaml) into any folder:

       curl -O https://raw.githubusercontent.com/millermatt090/dnd/main/conf/docker-compose-template/dungeon.yaml

3. In that folder run:

       docker compose -f dungeon.yaml up -d dungeon

4. Open http://localhost:8080

| Task | Command |
|---|---|
| Stop it | `docker stop dnd` |
| Start it again | `docker start dnd` |
| Update to the newest version | `docker compose -f dungeon.yaml pull` then `docker compose -f dungeon.yaml up -d dungeon` |
| Remove it | `docker compose -f dungeon.yaml down` |
| Run a specific version (e.g. 1.1.0) | `TAG=1.1.0 docker compose -f dungeon.yaml up -d dungeon` |
| Use another port (e.g. 9000) | `PORT=9000 docker compose -f dungeon.yaml up -d dungeon` (PowerShell: `$env:PORT=9000; docker compose -f dungeon.yaml up -d dungeon`) |

Works on Windows, macOS (Intel and Apple Silicon) and Linux.

## Build and run from source
    docker build -t dice-roller .
    docker run --rm --name dnd -p 8080:8000 dice-roller

Then open http://localhost:8080

Stop it with `docker stop dnd`.

## Versions and publishing
The project uses [Semantic Versioning](https://semver.org) (MAJOR.MINOR.PATCH); see [CHANGELOG.md](CHANGELOG.md).
Images are built for amd64 and arm64 by `.github/workflows/publish-image.yml`:

| Image tag | Points to |
|---|---|
| `1.0.0` | Exactly that release (what `dungeon.yaml` uses) |
| `1.0` / `1` | The newest release in that line |
| `latest` | The newest code on `main`, which may not be released yet |
| `sha-<commit>` | One specific commit |

Each release lives on its own branch, named after the version (e.g. `1.0.0`).
Pushing that branch publishes the version's image tags. To release a new version:
1. Create the branch: `git switch -c 1.1.0`
2. Update `version` in `package.json` and `server/package.json`, the default `TAG` in
   `conf/docker-compose-template/dungeon.yaml`, and add an entry to `CHANGELOG.md`.
3. Commit and push the branch:

       git push -u origin 1.1.0

Once pushed, leave a version branch alone; put fixes in a new patch branch such as `1.0.1`.

## Develop locally
Requires Node.js 24 LTS (or 22.22+). Run the server and the client in two terminals:

    cd server
    npm install
    npm run dev          # API on http://localhost:8000, restarts on save

    npm install          # from the project root
    npm start            # app on http://localhost:4200, reloads on save

The Angular dev server forwards `/api` requests to port 8000 (see `proxy.conf.json`).

## Project structure
```
.
├── .github/workflows/
│   └── publish-image.yml         Builds and publishes the image to ghcr.io
├── AGENTS.md                     Instructions for AI agents (single source of truth)
├── CHANGELOG.md                  Release notes for each version
├── Dockerfile                    Builds the app and server, runs them in one image
├── angular.json                  Angular workspace config (the app lives at the root)
├── conf/
│   └── docker-compose-template/
│       └── dungeon.yaml          Runs the published image (all a friend needs)
├── package.json                  Angular app dependencies
├── proxy.conf.json               Dev-server proxy to the API
├── scripts/                      Dev tools (git-ignored, not in the Docker image)
│   ├── generate_dice_assets.py   Draws the die face images
│   ├── generate_board_asset.py   Draws the velvet dice tray
│   └── requirements-dev.txt
├── server/                       TypeScript API (Express)
│   └── src/
│       ├── main.ts               Starts the server, serves the built client
│       ├── dice/dice.ts          Dice definitions and fair rolling
│       └── roll/roll-routes.ts   /api/roll endpoints
└── src/                          Angular app
    ├── index.html
    ├── main.ts                   Bootstraps the app
    ├── assets/                   Die faces (<die>/<face>.png) and board/board.jpg
    └── app/
        ├── app.ts / .html / .css     Root component: title and Dice Tower / Spell Slots tabs
        ├── dice-view/                The Dice Tower tab: shelf, selection bar, board, rolling
        ├── app.config.ts             App-wide providers (HTTP client)
        ├── dice.ts                   Shared dice constants and helpers
        ├── dice/
        │   └── dice-pool.ts          Dice selected for the next roll (signals)
        ├── die-button/               Clickable die that adds/removes itself from the pool
        ├── pool-tray/                Selected dice summary with Roll and Clear buttons
        ├── mode-picker/              Normal / Advantage / Disadvantage switch for d20s
        ├── dice-board/               Velvet dice tray the dice are thrown onto
        ├── rolling-die/              One die: tumbles, travels and lands on its result
        │   └── roll-path.ts          Shape of a die's path across the board
        ├── rolls/
        │   ├── roll-response.ts      JSON shapes returned by the API
        │   ├── die-roll.ts           Result of one standard die
        │   ├── percentile-roll.ts    Result of a d% roll (tens + ones)
        │   ├── advantage-roll.ts     A d20 rolled with advantage / disadvantage (kept + discarded)
        │   └── roll-result.ts        All rolls from one Roll press
        ├── api/
        │   └── dice-api.ts           Calls the backend roll endpoint
        ├── spell/                    Everything for the Spell Slots tab
        │   ├── spellbook/            The tab page
        │   ├── slot-tracker/         Slot gems per level, "Set slots" mode and Long rest
        │   └── spell-slots/
        │       └── slot-store.ts     Slot totals and spent slots, saved in the browser
        └── shared/
            ├── theme.css             Colour variables
            └── base.css              Page-wide defaults
```
Each component folder holds its `.ts`, `.html` and `.css` files.

## API
    GET /api/roll?dice=d20&dice=d4     roll a mixed set (1..20 dice)
    GET /api/roll/{die}?count=N        roll N of one die (1..20)

Add `&mode=advantage` or `&mode=disadvantage` to either: each d20 is rolled twice and the
higher / lower result is kept (other dice are unaffected). Those d20s also report the
`discarded` result.

Dice: d4, d6, d8, d10, d12, d20, d100 (percentile).

## Dice images
`src/assets/<die>/<face>.png` holds one image per face (d% faces are `00`–`90`;
`d10/0.png` is only used as the ones digit of a d% roll). To regenerate them:

    pip install -r scripts/requirements-dev.txt
    python scripts/generate_dice_assets.py
    python scripts/generate_board_asset.py
