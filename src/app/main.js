import { DicePool } from "./dice/dice-pool.js";
import { DiceApi } from "./api/dice-api.js";
import { DieButton } from "./die-button/die-button.js";
import { PoolTray } from "./pool-tray/pool-tray.js";
import { DiceBoard } from "./dice-board/dice-board.js";

const pool = new DicePool();
const api = new DiceApi();

const board = new DiceBoard({
    board: document.getElementById("board"),
    message: document.getElementById("board-message"),
    status: document.getElementById("board-status"),
});

async function rollPool() {
    try {
        const result = await api.roll(pool.dice());
        board.throw(result);
    } catch (error) {
        board.showError(error.message);
    }
}

document.querySelectorAll("button.die").forEach((element) => new DieButton(element, pool));

new PoolTray(
    {
        summary: document.getElementById("pool-summary"),
        rollButton: document.getElementById("roll-button"),
        clearButton: document.getElementById("clear-button"),
    },
    pool,
    rollPool,
);
