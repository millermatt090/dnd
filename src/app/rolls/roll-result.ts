import { AdvantageRoll } from "./advantage-roll";
import { DieRoll } from "./die-roll";
import { PercentileRoll } from "./percentile-roll";
import { DieRollJson, RollResponse } from "./roll-response";

function createRoll(json: DieRollJson): DieRoll {
    if (json.die === "d100") {
        return new PercentileRoll(json.value, json.tens ?? 0, json.ones ?? 0);
    }
    if (json.mode && json.discarded !== undefined) {
        return new AdvantageRoll(json.value, json.discarded, json.mode);
    }

    return new DieRoll(json.die, json.value);
}

/**
 * Everything returned by one press of the Roll button.
 */
export class RollResult {
    readonly rolls: DieRoll[];

    constructor(response: RollResponse) {
        this.rolls = response.rolls.map(createRoll);
    }

    describe(): string {
        return this.rolls.map((roll) => roll.describe()).join(", ");
    }
}
