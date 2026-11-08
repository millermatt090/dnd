import { faceSrc } from "../dice";
import { DieFace, DieRoll } from "./die-roll";

/**
 * A d% roll: a tens die (00-90) plus a d10 ones die (0-9).
 */
export class PercentileRoll extends DieRoll {
    constructor(
        value: number,
        readonly tens: number,
        readonly ones: number,
    ) {
        super("d100", value);
    }

    get tensLabel(): string {
        return String(this.tens).padStart(2, "0");
    }

    override faces(): DieFace[] {
        return [
            { die: "d100", src: faceSrc("d100", this.tensLabel), alt: `d% ${this.tensLabel}` },
            { die: "d10", src: faceSrc("d10", this.ones), alt: `d10 ${this.ones}` },
        ];
    }

    override describe(): string {
        return `d% ${this.tensLabel}+${this.ones}=${this.value}`;
    }
}
