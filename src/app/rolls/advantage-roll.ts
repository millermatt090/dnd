import { faceSrc } from "../dice";
import { DieFace, DieRoll } from "./die-roll";

/**
 * A d20 rolled with advantage (keep the higher of two) or disadvantage (keep the lower).
 * Both dice land on the board; the one that wasn't kept is marked as discarded.
 */
export class AdvantageRoll extends DieRoll {
    constructor(
        value: number,
        readonly discarded: number,
        readonly mode: "advantage" | "disadvantage",
    ) {
        super("d20", value);
    }

    override faces(): DieFace[] {
        return [
            ...super.faces(),
            {
                die: "d20",
                src: faceSrc("d20", this.discarded),
                alt: `d20 ${this.discarded}, discarded`,
                discarded: true,
            },
        ];
    }

    override describe(): string {
        return `d20 ${this.value} with ${this.mode} (other die ${this.discarded})`;
    }
}
