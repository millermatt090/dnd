import { DIE_ORDER, MAX_DICE, dieLabel } from "../dice.js";

/**
 * The set of dice selected for the next roll, e.g. 1d20 + 2d4.
 * Listeners registered with onChange() are called after every change.
 */
export class DicePool {
    #counts = new Map();
    #size = 0;
    #listeners = [];

    onChange(listener) {
        this.#listeners.push(listener);
    }

    count(die) {
        return this.#counts.get(die) ?? 0;
    }

    get size() {
        return this.#size;
    }

    get isEmpty() {
        return this.#size === 0;
    }

    get isFull() {
        return this.#size >= MAX_DICE;
    }

    add(die) {
        if (this.isFull) {
            return;
        }

        this.#counts.set(die, this.count(die) + 1);
        this.#size += 1;
        this.#notify();
    }

    remove(die) {
        if (this.count(die) === 0) {
            return;
        }

        this.#counts.set(die, this.count(die) - 1);
        this.#size -= 1;
        this.#notify();
    }

    clear() {
        this.#counts.clear();
        this.#size = 0;
        this.#notify();
    }

    // Every selected die as a flat list, e.g. ["d4", "d4", "d20"].
    dice() {
        return DIE_ORDER.flatMap((die) => Array(this.count(die)).fill(die));
    }

    // Standard dice notation, e.g. "2d4 + 1d20".
    notation() {
        return DIE_ORDER
            .filter((die) => this.count(die) > 0)
            .map((die) => `${this.count(die)}${dieLabel(die)}`)
            .join(" + ");
    }

    #notify() {
        this.#listeners.forEach((listener) => listener(this));
    }
}
