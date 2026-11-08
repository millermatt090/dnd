import { randomInt } from "node:crypto";

export const MAX_DICE = 20;

export const DICE = {
    d4: 4,
    d6: 6,
    d8: 8,
    d10: 10,
    d12: 12,
    d20: 20,
    d100: 100,
} as const;

export type Die = keyof typeof DICE;

// Advantage / disadvantage apply to d20s: roll two, keep the higher / lower.
export const ROLL_MODES = ["normal", "advantage", "disadvantage"] as const;

export type RollMode = (typeof ROLL_MODES)[number];

export interface DieRoll {
    die: Die;
    value: number;
    tens?: number; // d% only
    ones?: number; // d% only
    mode?: Exclude<RollMode, "normal">; // d20 with advantage / disadvantage only
    discarded?: number; // the d20 result that was not kept
}

export function isDie(value: string): value is Die {
    return Object.hasOwn(DICE, value);
}

export function isRollMode(value: string): value is RollMode {
    return (ROLL_MODES as readonly string[]).includes(value);
}

// Cryptographically fair roll from 1..sides.
export function roll(sides: number): number {
    return randomInt(1, sides + 1);
}

// d% (00-90) + d10 (0-9), like the physical dice; 00 + 0 counts as 100.
export function rollPercentile(): { tens: number; ones: number; total: number } {
    const tens = randomInt(10) * 10;
    const ones = randomInt(10);
    const total = tens + ones;

    return { tens, ones, total: total === 0 ? 100 : total };
}

export function rollOne(die: Die, mode: RollMode = "normal"): DieRoll {
    if (die === "d100") {
        const { tens, ones, total } = rollPercentile();
        return { die, value: total, tens, ones };
    }

    if (die === "d20" && mode !== "normal") {
        const first = roll(20);
        const second = roll(20);
        const keepHigher = mode === "advantage";
        const value = keepHigher ? Math.max(first, second) : Math.min(first, second);
        const discarded = keepHigher ? Math.min(first, second) : Math.max(first, second);

        return { die, value, mode, discarded };
    }

    return { die, value: roll(DICE[die]) };
}
