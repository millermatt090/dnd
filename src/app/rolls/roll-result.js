import { DieRoll } from "./die-roll.js";
import { PercentileRoll } from "./percentile-roll.js";

function createRoll(json) {
    return json.die === "d100" ? new PercentileRoll(json) : new DieRoll(json);
}

/**
 * Everything returned by one press of the Roll button.
 */
export class RollResult {
    constructor({ rolls, total }) {
        this.rolls = rolls.map(createRoll);
        this.total = total;
    }

    // The total is only coloured when a single d20 was rolled on its own.
    get critClass() {
        return this.rolls.length === 1 ? this.rolls[0].critClass : "";
    }

    describe() {
        return this.rolls.map((roll) => roll.describe()).join(", ");
    }
}
