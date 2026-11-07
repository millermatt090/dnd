import { faceSrc } from "../dice.js";
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
            { die: "d100", src: faceSrc("d100", this.tensLabel), alt: `d% ${this.tensLabel}` },
            { die: "d10", src: faceSrc("d10", this.ones), alt: `d10 ${this.ones}` },
        ];
    }

    describe() {
        return `d% ${this.tensLabel}+${this.ones}=${this.value}`;
    }
}
