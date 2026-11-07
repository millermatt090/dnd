# Dice Roller

A web dice roller for D&D: d4, d6, d8, d10, d12, d20 and d% (percentile).

## Run with Docker
    docker build -t dice-roller .
    docker run --rm -p 8000:8000 dice-roller

Open http://localhost:8000

## Project structure
```
.
├── Dockerfile
├── requirements.txt              Python runtime dependencies
├── scripts/                      Dev tools (not included in the Docker image)
│   ├── generate_dice_assets.py   Draws the die face images
│   └── requirements-dev.txt
└── src/
    ├── main.py                   FastAPI backend: roll API, serves the front end
    ├── assets/                   Die face images, src/assets/<die>/<face>.png
    └── app/                      Front end (served at /app)
        ├── index.html
        ├── main.js               Entry point: creates and wires the components
        ├── dice.js               Shared dice constants and labels
        ├── dice/
        │   └── dice-pool.js      Dice selected for the next roll
        ├── die-button/
        │   ├── die-button.js     Clickable die that adds/removes itself from the pool
        │   └── die-button.css
        ├── pool-tray/
        │   ├── pool-tray.js      Selected dice summary with Roll and Clear buttons
        │   └── pool-tray.css
        ├── results-view/
        │   ├── results-view.js   Die faces, total and breakdown of a roll
        │   └── results-view.css
        ├── rolls/
        │   ├── die-roll.js       Result of one standard die
        │   ├── percentile-roll.js  Result of a d% roll (tens + ones)
        │   └── roll-result.js    All rolls and the total from one Roll press
        ├── api/
        │   └── dice-api.js       Calls the backend roll endpoint
        └── shared/
            ├── theme.css         Colour variables
            └── base.css          Page-wide defaults
```

## API
    GET /api/roll?dice=d20&dice=d4     roll a mixed set (1..20 dice)
    GET /api/roll/{die}?count=N        roll N of one die (1..20)

Dice: d4, d6, d8, d10, d12, d20, d100 (percentile).

## Dice images
`src/assets/<die>/<face>.png` holds one image per face (d% faces are `00`–`90`;
`d10/0.png` is only used as the ones digit of a d% roll). To regenerate them:

    pip install -r scripts/requirements-dev.txt
    python scripts/generate_dice_assets.py
