"""D&D dice roller web app."""
import secrets
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

DICE = {"d4": 4, "d6": 6, "d8": 8, "d10": 10, "d12": 12, "d20": 20, "d100": 100}
SRC = Path(__file__).parent
APP = SRC / "app"
ASSETS = SRC / "assets"

app = FastAPI(title="Dice Roller")
app.mount("/app", StaticFiles(directory=APP), name="app")
app.mount("/assets", StaticFiles(directory=ASSETS), name="assets")


def roll(sides: int) -> int:
    """Cryptographically fair roll from 1..sides."""
    return secrets.randbelow(sides) + 1


def roll_percentile() -> dict:
    """Roll d% (00-90) + d10 (0-9) like the physical dice; 00 + 0 = 100."""
    tens = secrets.randbelow(10) * 10
    ones = secrets.randbelow(10)
    total = tens + ones
    return {"tens": tens, "ones": ones, "total": 100 if total == 0 else total}


MAX_DICE = 20


def roll_one(die: str) -> dict:
    """Roll a single die and describe the result."""
    if die == "d100":
        result = roll_percentile()
        return {"die": die, "value": result["total"], "tens": result["tens"], "ones": result["ones"]}
    return {"die": die, "value": roll(DICE[die])}


@app.get("/api/roll")
def roll_pool(dice: list[str] = Query(...)):
    """Roll a mixed set of dice, e.g. /api/roll?dice=d20&dice=d4."""
    dice = [d.lower() for d in dice]
    unknown = sorted(set(dice) - DICE.keys())
    if unknown:
        raise HTTPException(404, f"Unknown dice {unknown}. Choose from {list(DICE)}")
    if not 1 <= len(dice) <= MAX_DICE:
        raise HTTPException(422, f"Roll between 1 and {MAX_DICE} dice")
    rolls = [roll_one(d) for d in dice]
    return {"rolls": rolls, "total": sum(r["value"] for r in rolls)}


@app.get("/api/roll/{die}")
def roll_die(die: str, count: int = Query(1, ge=1, le=20)):
    die = die.lower()
    if die not in DICE:
        raise HTTPException(404, f"Unknown die '{die}'. Choose from {list(DICE)}")
    if die == "d100":
        rolls = [roll_percentile() for _ in range(count)]
        return {"die": die, "rolls": rolls, "total": sum(r["total"] for r in rolls)}
    rolls = [roll(DICE[die]) for _ in range(count)]
    return {"die": die, "rolls": rolls, "total": sum(rolls)}


@app.get("/healthz")
def health():
    return {"status": "ok"}


@app.get("/")
def index():
    return FileResponse(APP / "index.html")
