import { Component, signal } from "@angular/core";

import { DiceView } from "./dice-view/dice-view";
import { Spellbook } from "./spell/spellbook/spellbook";

type View = "dice" | "spells";

@Component({
    selector: "app-root",
    imports: [DiceView, Spellbook],
    templateUrl: "./app.html",
    styleUrl: "./app.css",
})
export class App {
    protected readonly views: { id: View; label: string }[] = [
        { id: "dice", label: "Dice Tower" },
        { id: "spells", label: "Spell Slots" },
    ];

    // Both views stay alive when hidden, so dice on the board survive a trip to the spellbook.
    protected readonly view = signal<View>("dice");
}
