export const MAX_DICE = 20;

// Display order for the pool and dice notation.
export const DIE_ORDER = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"];

export function dieLabel(die) {
    return die === "d100" ? "d%" : die;
}
