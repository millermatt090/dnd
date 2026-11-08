# Dice Roller

A web dice roller for D&D: d4, d6, d8, d10, d12, d20 and d% (percentile).
Built with an Angular + TypeScript front end and a TypeScript (Express) API.

## Run with Docker
    docker build -t dice-roller .
    docker run --rm --name dungeons -p 8000:8000 dice-roller

Stop it with `docker stop dungeons`.

Open http://localhost:8000

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
├── Dockerfile                    Builds the app and server, runs them in one image
├── angular.json                  Angular workspace config (the app lives at the root)
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
        ├── app.ts / .html / .css     Root component: page layout and rolling
        ├── app.config.ts             App-wide providers (HTTP client)
        ├── dice.ts                   Shared dice constants and helpers
        ├── dice/
        │   └── dice-pool.ts          Dice selected for the next roll (signals)
        ├── die-button/               Clickable die that adds/removes itself from the pool
        ├── pool-tray/                Selected dice summary with Roll and Clear buttons
        ├── dice-board/               Velvet dice tray the dice are thrown onto
        ├── rolling-die/              One die: tumbles, travels and lands on its result
        │   └── roll-path.ts          Shape of a die's path across the board
        ├── rolls/
        │   ├── roll-response.ts      JSON shapes returned by the API
        │   ├── die-roll.ts           Result of one standard die
        │   ├── percentile-roll.ts    Result of a d% roll (tens + ones)
        │   └── roll-result.ts        All rolls from one Roll press
        ├── api/
        │   └── dice-api.ts           Calls the backend roll endpoint
        └── shared/
            ├── theme.css             Colour variables
            └── base.css              Page-wide defaults
```
Each component folder holds its `.ts`, `.html` and `.css` files.

## API
    GET /api/roll?dice=d20&dice=d4     roll a mixed set (1..20 dice)
    GET /api/roll/{die}?count=N        roll N of one die (1..20)

Dice: d4, d6, d8, d10, d12, d20, d100 (percentile).

## Dice images
`src/assets/<die>/<face>.png` holds one image per face (d% faces are `00`–`90`;
`d10/0.png` is only used as the ones digit of a d% roll). To regenerate them:

    pip install -r scripts/requirements-dev.txt
    python scripts/generate_dice_assets.py
    python scripts/generate_board_asset.py
