export const MAX_DICE = 20;

// Display order for the dice row, the pool and dice notation.
export const DIE_ORDER = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"] as const;

export type Die = (typeof DIE_ORDER)[number];

// Advantage / disadvantage apply to d20s: roll two, keep the higher / lower.
export const ROLL_MODES = ["normal", "advantage", "disadvantage"] as const;

export type RollMode = (typeof ROLL_MODES)[number];

export function rollModeLabel(mode: RollMode): string {
    return mode.charAt(0).toUpperCase() + mode.slice(1);
}

const SIDES: Record<Exclude<Die, "d100">, number> = {
    d4: 4,
    d6: 6,
    d8: 8,
    d10: 10,
    d12: 12,
    d20: 20,
};

export function dieLabel(die: Die): string {
    return die === "d100" ? "d%" : die;
}

export function faceSrc(die: Die, face: string | number): string {
    return `/assets/${die}/${face}.png`;
}

// Face names as used in the image file names, e.g. d6 -> [1..6], d100 -> ["00".."90"].
export function faceNames(die: Die): (string | number)[] {
    if (die === "d100") {
        return Array.from({ length: 10 }, (_, i) => String(i * 10).padStart(2, "0"));
    }

    return Array.from({ length: SIDES[die] }, (_, i) => i + 1);
}

// The face shown on a die's button: its highest number, or "00" for d%.
export function iconSrc(die: Die): string {
    return faceSrc(die, die === "d100" ? "00" : SIDES[die]);
}

export function randomFaceSrc(die: Die): string {
    const names = faceNames(die);
    return faceSrc(die, names[Math.floor(Math.random() * names.length)]);
}

export function allFaceSrcs(): string[] {
    return DIE_ORDER.flatMap((die) => faceNames(die).map((name) => faceSrc(die, name)));
}
