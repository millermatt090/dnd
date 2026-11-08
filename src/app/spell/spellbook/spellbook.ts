import { Component } from "@angular/core";

import { SlotTracker } from "../slot-tracker/slot-tracker";

/**
 * The spell slots page: set your slots, spend them, and restore them on a long rest.
 */
@Component({
    selector: "app-spellbook",
    imports: [SlotTracker],
    templateUrl: "./spellbook.html",
    styleUrl: "./spellbook.css",
})
export class Spellbook {}
