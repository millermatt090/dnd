import { Component, inject } from "@angular/core";

import { DicePool } from "../dice/dice-pool";
import { ROLL_MODES, rollModeLabel } from "../dice";

/**
 * Normal / Advantage / Disadvantage switch for the next roll.
 * Only usable while a d20 is selected, since the modes apply to d20s.
 */
@Component({
    selector: "app-mode-picker",
    templateUrl: "./mode-picker.html",
    styleUrl: "./mode-picker.css",
})
export class ModePicker {
    protected readonly pool = inject(DicePool);
    protected readonly modes = ROLL_MODES;
    protected readonly label = rollModeLabel;
}
