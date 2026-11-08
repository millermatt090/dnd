import { Injectable, computed, signal } from "@angular/core";

import { DIE_ORDER, Die, MAX_DICE, RollMode, dieLabel } from "../dice";

/**
 * The set of dice selected for the next roll, e.g. 1d20 + 2d4, and the roll mode
 * (normal, advantage or disadvantage). State is held in signals, so anything that
 * reads it updates automatically.
 */
@Injectable({ providedIn: "root" })
export class DicePool {
    private readonly counts = signal<ReadonlyMap<Die, number>>(new Map());
    private readonly chosenMode = signal<RollMode>("normal");

    readonly size = computed(() =>
        Array.from(this.counts().values()).reduce((sum, count) => sum + count, 0),
    );

    readonly isEmpty = computed(() => this.size() === 0);

    readonly isFull = computed(() => this.size() >= MAX_DICE);

    // Standard dice notation, e.g. "2d4 + 1d20".
    readonly notation = computed(() =>
        DIE_ORDER
            .filter((die) => this.count(die) > 0)
            .map((die) => `${this.count(die)}${dieLabel(die)}`)
            .join(" + "),
    );

    // Advantage and disadvantage only mean something when a d20 is in the pool.
    readonly hasD20 = computed(() => this.count("d20") > 0);

    // The mode the next roll will actually use.
    readonly mode = computed<RollMode>(() => (this.hasD20() ? this.chosenMode() : "normal"));

    // Notation plus the mode, e.g. "1d4 + 1d20 with advantage".
    readonly summary = computed(() =>
        this.mode() === "normal" ? this.notation() : `${this.notation()} with ${this.mode()}`,
    );

    count(die: Die): number {
        return this.counts().get(die) ?? 0;
    }

    add(die: Die): void {
        if (!this.isFull()) {
            this.change(die, 1);
        }
    }

    remove(die: Die): void {
        if (this.count(die) > 0) {
            this.change(die, -1);
        }
    }

    setMode(mode: RollMode): void {
        this.chosenMode.set(mode);
    }

    clear(): void {
        this.counts.set(new Map());
        this.chosenMode.set("normal");
    }

    // Every selected die as a flat list, e.g. ["d4", "d4", "d20"].
    dice(): Die[] {
        return DIE_ORDER.flatMap((die) => Array<Die>(this.count(die)).fill(die));
    }

    private change(die: Die, delta: number): void {
        this.counts.update((counts) => new Map(counts).set(die, (counts.get(die) ?? 0) + delta));
    }
}
