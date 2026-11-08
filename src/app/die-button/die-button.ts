import { Component, computed, inject, input } from "@angular/core";

import { DicePool } from "../dice/dice-pool";
import { Die, dieLabel, iconSrc } from "../dice";

/**
 * One clickable die. Clicking adds it to the pool; clicking its badge
 * or right-clicking removes one.
 */
@Component({
    selector: "app-die-button",
    templateUrl: "./die-button.html",
    styleUrl: "./die-button.css",
})
export class DieButton {
    readonly die = input.required<Die>();

    private readonly pool = inject(DicePool);

    protected readonly count = computed(() => this.pool.count(this.die()));
    protected readonly label = computed(() => dieLabel(this.die()));
    protected readonly icon = computed(() => iconSrc(this.die()));
    protected readonly disabled = computed(() => this.pool.isFull() && this.count() === 0);

    protected add(): void {
        this.pool.add(this.die());
    }

    protected removeOne(event: Event): void {
        event.preventDefault();
        event.stopPropagation(); // don't let a badge click also add a die
        this.pool.remove(this.die());
    }
}
