import { Component, inject, viewChild } from "@angular/core";

import { DiceApi } from "../api/dice-api";
import { DiceBoard } from "../dice-board/dice-board";
import { DicePool } from "../dice/dice-pool";
import { DIE_ORDER } from "../dice";
import { DieButton } from "../die-button/die-button";
import { PoolTray } from "../pool-tray/pool-tray";

/**
 * The dice page: pick dice from the shelf, roll them, watch them land on the board.
 */
@Component({
    selector: "app-dice-view",
    imports: [DieButton, PoolTray, DiceBoard],
    templateUrl: "./dice-view.html",
    styleUrl: "./dice-view.css",
})
export class DiceView {
    protected readonly dieOrder = DIE_ORDER;

    private readonly pool = inject(DicePool);
    private readonly api = inject(DiceApi);
    private readonly board = viewChild.required(DiceBoard);

    protected async roll(): Promise<void> {
        try {
            const result = await this.api.roll(this.pool.dice(), this.pool.mode());
            this.board().throw(result);
            this.pool.clear(); // start each roll with a fresh selection
        } catch (error) {
            this.board().showError(error instanceof Error ? error.message : "Roll failed");
        }
    }
}
