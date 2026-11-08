import { Die } from "../dice";

// Shapes of the JSON returned by GET /api/roll.

export interface DieRollJson {
    die: Die;
    value: number;
    tens?: number; // d% only
    ones?: number; // d% only
}

export interface RollResponse {
    rolls: DieRollJson[];
    total: number;
}
