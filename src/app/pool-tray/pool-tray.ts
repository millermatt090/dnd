import { Component, inject, output } from "@angular/core";

import { DicePool } from "../dice/dice-pool";

/**
 * The bar showing the selected dice, with the Roll and Clear buttons.
 */
@Component({
    selector: "app-pool-tray",
    templateUrl: "./pool-tray.html",
    styleUrl: "./pool-tray.css",
})
export class PoolTray {
    readonly roll = output<void>();

    protected readonly pool = inject(DicePool);
}
