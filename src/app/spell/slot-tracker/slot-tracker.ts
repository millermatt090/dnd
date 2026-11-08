import { Component, computed, inject, signal } from "@angular/core";

import { MAX_SLOTS_PER_LEVEL, SlotStore } from "../spell-slots/slot-store";

interface SlotRow {
    index: number; // 0 = 1st-level slots
    label: string;
    total: number;
    available: number;
    gems: boolean[]; // one per slot; true = available
}

function ordinal(level: number): string {
    const suffix = level === 1 ? "st" : level === 2 ? "nd" : level === 3 ? "rd" : "th";
    return `${level}${suffix}`;
}

/**
 * Spell slots as rows of gems. "Set slots" chooses how many slots there are at each level;
 * click a gem to spend a slot and a spent gem to get it back. A long rest restores them all.
 */
@Component({
    selector: "app-slot-tracker",
    templateUrl: "./slot-tracker.html",
    styleUrl: "./slot-tracker.css",
})
export class SlotTracker {
    protected readonly store = inject(SlotStore);
    protected readonly maxPerLevel = MAX_SLOTS_PER_LEVEL;

    // Opens in setting mode on a first visit (no slots yet); after that the player toggles it.
    protected readonly setting = signal(!this.store.hasSlots());

    protected readonly rows = computed<SlotRow[]>(() =>
        this.store
            .total()
            .map((total, index) => {
                const available = this.store.available()[index];
                return {
                    index,
                    label: ordinal(index + 1),
                    total,
                    available,
                    gems: Array.from({ length: total }, (_, i) => i < available),
                };
            })
            // While setting, show every level so slots can be added anywhere.
            .filter((row) => row.total > 0 || this.setting()),
    );

    protected toggle(row: SlotRow, available: boolean): void {
        if (available) {
            this.store.spend(row.index);
        } else {
            this.store.recover(row.index);
        }
    }
}
