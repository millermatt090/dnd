import { Die } from "../dice";

// Shapes of the JSON returned by GET /api/roll.

export interface DieRollJson {
    die: Die;
    value: number;
    tens?: number; // d% only
    ones?: number; // d% only
    mode?: "advantage" | "disadvantage"; // d20 rolled with advantage / disadvantage only
    discarded?: number; // the d20 result that was not kept
}

export interface RollResponse {
    rolls: DieRollJson[];
    total: number;
}
