import { DieRoll } from "./die-roll.js";
import { PercentileRoll } from "./percentile-roll.js";

function createRoll(json) {
    return json.die === "d100" ? new PercentileRoll(json) : new DieRoll(json);
}

/**
 * Everything returned by one press of the Roll button.
 */
export class RollResult {
    constructor({ rolls }) {
        this.rolls = rolls.map(createRoll);
    }

    describe() {
        return this.rolls.map((roll) => roll.describe()).join(", ");
    }
}
