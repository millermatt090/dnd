import { Injectable, computed, effect, signal } from "@angular/core";

const STORAGE_KEY = "dice-tower.spell-slots.v1";

// Spell slot levels 1st-9th; each list holds one number per level (index 0 = 1st level).
export const SLOT_LEVEL_COUNT = 9;

// Upper limit per level; generous enough for magic items and DM rulings.
export const MAX_SLOTS_PER_LEVEL = 9;

interface SlotState {
    total: number[]; // slots the player has at each level
    used: number[]; // slots spent since the last long rest
}

function perLevel(value: unknown): number[] {
    const values = Array.isArray(value) ? value : [];
    return Array.from({ length: SLOT_LEVEL_COUNT }, (_, i) => {
        const n = Number(values[i]);
        return Number.isInteger(n) ? Math.min(MAX_SLOTS_PER_LEVEL, Math.max(0, n)) : 0;
    });
}

function change(values: number[], index: number, update: (value: number) => number): number[] {
    return values.map((value, i) => (i === index ? update(value) : value));
}

/**
 * The player's spell slots: how many they have at each level and how many are spent.
 * Saved in this browser's localStorage so it survives a reload.
 */
@Injectable({ providedIn: "root" })
export class SlotStore {
    private readonly state = signal<SlotState>(this.load());

    readonly total = computed(() => this.state().total);

    readonly available = computed(() =>
        this.state().total.map((total, i) => total - Math.min(this.state().used[i], total)),
    );

    readonly hasSlots = computed(() => this.total().some((total) => total > 0));

    constructor() {
        effect(() => this.save(this.state()));
    }

    // Add (+1) or remove (-1) slots at one level (index 0 = 1st level). Works from the
    // stored value, so quick repeated clicks are never lost.
    changeTotal(index: number, delta: number): void {
        this.state.update(({ total, used }) => {
            const next = Math.min(MAX_SLOTS_PER_LEVEL, Math.max(0, total[index] + delta));
            return {
                total: change(total, index, () => next),
                used: change(used, index, (spent) => Math.min(spent, next)),
            };
        });
    }

    spend(index: number): void {
        if (this.available()[index] > 0) {
            this.state.update(({ total, used }) => ({ total, used: change(used, index, (spent) => spent + 1) }));
        }
    }

    recover(index: number): void {
        this.state.update(({ total, used }) => ({ total, used: change(used, index, (spent) => Math.max(0, spent - 1)) }));
    }

    // Long rest: every spent slot comes back.
    longRest(): void {
        this.state.update(({ total }) => ({ total, used: perLevel([]) }));
    }

    private load(): SlotState {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<SlotState> | null;
            const total = perLevel(saved?.total);
            const used = perLevel(saved?.used).map((spent, i) => Math.min(spent, total[i]));
            return { total, used };
        } catch {
            return { total: perLevel([]), used: perLevel([]) };
        }
    }

    private save(state: SlotState): void {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch {
            // Storage can be unavailable (private browsing, full quota); slots still work this session.
        }
    }
}
