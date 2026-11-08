import { Router } from "express";

import { DICE, type Die, type DieRoll, MAX_DICE, isDie, rollOne } from "../dice/dice.js";

// A query value may arrive as one string, a list of strings, or not at all.
function toList(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === "string");
    }

    return typeof value === "string" ? [value] : [];
}

function total(rolls: DieRoll[]): number {
    return rolls.reduce((sum, roll) => sum + roll.value, 0);
}

const choices = JSON.stringify(Object.keys(DICE));

export const rollRoutes = Router();

// Roll a mixed set of dice, e.g. /api/roll?dice=d20&dice=d4
rollRoutes.get("/roll", (req, res) => {
    const dice = toList(req.query["dice"]).map((die) => die.toLowerCase());
    const unknown = [...new Set(dice.filter((die) => !isDie(die)))].sort();

    if (unknown.length > 0) {
        res.status(404).json({ detail: `Unknown dice ${JSON.stringify(unknown)}. Choose from ${choices}` });
        return;
    }
    if (dice.length < 1 || dice.length > MAX_DICE) {
        res.status(422).json({ detail: `Roll between 1 and ${MAX_DICE} dice` });
        return;
    }

    const rolls = (dice as Die[]).map(rollOne);
    res.json({ rolls, total: total(rolls) });
});

// Roll several of one die, e.g. /api/roll/d6?count=3
rollRoutes.get("/roll/:die", (req, res) => {
    const die = req.params.die.toLowerCase();
    const count = Number(req.query["count"] ?? 1);

    if (!isDie(die)) {
        res.status(404).json({ detail: `Unknown die '${die}'. Choose from ${choices}` });
        return;
    }
    if (!Number.isInteger(count) || count < 1 || count > MAX_DICE) {
        res.status(422).json({ detail: `count must be a whole number from 1 to ${MAX_DICE}` });
        return;
    }

    const rolls = Array.from({ length: count }, () => rollOne(die));
    res.json({ die, rolls, total: total(rolls) });
});
