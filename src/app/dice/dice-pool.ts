import { Injectable, computed, signal } from "@angular/core";

import { DIE_ORDER, Die, MAX_DICE, dieLabel } from "../dice";

/**
 * The set of dice selected for the next roll, e.g. 1d20 + 2d4.
 * State is held in signals, so anything that reads it updates automatically.
 */
@Injectable({ providedIn: "root" })
export class DicePool {
    private readonly counts = signal<ReadonlyMap<Die, number>>(new Map());

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

    clear(): void {
        this.counts.set(new Map());
    }

    // Every selected die as a flat list, e.g. ["d4", "d4", "d20"].
    dice(): Die[] {
        return DIE_ORDER.flatMap((die) => Array<Die>(this.count(die)).fill(die));
    }

    private change(die: Die, delta: number): void {
        this.counts.update((counts) => new Map(counts).set(die, (counts.get(die) ?? 0) + delta));
    }
}
