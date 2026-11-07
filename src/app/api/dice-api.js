import { RollResult } from "../rolls/roll-result.js";

/**
 * Talks to the backend roll endpoint.
 */
export class DiceApi {
    async roll(dice) {
        const query = new URLSearchParams(dice.map((die) => ["dice", die]));
        const response = await fetch(`/api/roll?${query}`);

        if (!response.ok) {
            throw new Error(`Roll failed (${response.status})`);
        }

        return new RollResult(await response.json());
    }
}
