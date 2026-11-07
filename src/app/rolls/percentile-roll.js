import { DieRoll } from "./die-roll.js";

/**
 * A d% roll: a tens die (00-90) plus a d10 ones die (0-9).
 */
export class PercentileRoll extends DieRoll {
    constructor({ die, value, tens, ones }) {
        super({ die, value });
        this.tens = tens;
        this.ones = ones;
    }

    get tensLabel() {
        return String(this.tens).padStart(2, "0");
    }

    faces() {
        return [
            { src: `/assets/d100/${this.tensLabel}.png`, alt: `d% ${this.tensLabel}` },
            { src: `/assets/d10/${this.ones}.png`, alt: `d10 ${this.ones}` },
        ];
    }

    describe() {
        return `d% ${this.tensLabel}+${this.ones}=${this.value}`;
    }
}
