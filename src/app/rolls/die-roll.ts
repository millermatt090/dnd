import { Die, faceSrc } from "../dice";

export type CritClass = "" | "crit" | "fumble";

// One physical die that lands on the board.
export interface DieFace {
    die: Die;
    src: string;
    alt: string;
    discarded?: boolean; // the lower / higher d20 dropped by advantage / disadvantage
}

/**
 * The result of rolling one standard die (d4 through d20).
 */
export class DieRoll {
    constructor(
        readonly die: Die,
        readonly value: number,
    ) {}

    // "crit" for a natural 20 on a d20, "fumble" for a natural 1, otherwise "".
    get critClass(): CritClass {
        if (this.die !== "d20") {
            return "";
        }
        if (this.value === 20) {
            return "crit";
        }
        if (this.value === 1) {
            return "fumble";
        }
        return "";
    }

    faces(): DieFace[] {
        return [
            {
                die: this.die,
                src: faceSrc(this.die, this.value),
                alt: `${this.die} ${this.value}`,
            },
        ];
    }

    describe(): string {
        return `${this.die} ${this.value}`;
    }
}
