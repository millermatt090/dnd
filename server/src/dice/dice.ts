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

export interface DieRoll {
    die: Die;
    value: number;
    tens?: number; // d% only
    ones?: number; // d% only
}

export function isDie(value: string): value is Die {
    return Object.hasOwn(DICE, value);
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

export function rollOne(die: Die): DieRoll {
    if (die === "d100") {
        const { tens, ones, total } = rollPercentile();
        return { die, value: total, tens, ones };
    }

    return { die, value: roll(DICE[die]) };
}
