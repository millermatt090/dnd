import { Component, inject, output } from "@angular/core";

import { DicePool } from "../dice/dice-pool";
import { ModePicker } from "../mode-picker/mode-picker";

/**
 * The bar showing the selected dice, the roll mode, and the Roll and Clear buttons.
 */
@Component({
    selector: "app-pool-tray",
    imports: [ModePicker],
    templateUrl: "./pool-tray.html",
    styleUrl: "./pool-tray.css",
})
export class PoolTray {
    readonly roll = output<void>();

    protected readonly pool = inject(DicePool);
}
