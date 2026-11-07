/**
 * The result of rolling one standard die (d4 through d20).
 */
export class DieRoll {
    constructor({ die, value }) {
        this.die = die;
        this.value = value;
    }

    // "crit" for a natural 20 on a d20, "fumble" for a natural 1, otherwise "".
    get critClass() {
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

    // Images to show for this roll: [{ src, alt }].
    faces() {
        return [
            {
                src: `/assets/${this.die}/${this.value}.png`,
                alt: `${this.die} ${this.value}`,
            },
        ];
    }

    describe() {
        return `${this.die} ${this.value}`;
    }
}
