import { DicePool } from "./dice/dice-pool.js";
import { DiceApi } from "./api/dice-api.js";
import { DieButton } from "./die-button/die-button.js";
import { PoolTray } from "./pool-tray/pool-tray.js";
import { ResultsView } from "./results-view/results-view.js";

const pool = new DicePool();
const api = new DiceApi();

const results = new ResultsView({
    faces: document.getElementById("faces"),
    total: document.getElementById("result"),
    detail: document.getElementById("detail"),
});

async function rollPool() {
    try {
        const result = await api.roll(pool.dice());
        results.show(result, pool.notation());
    } catch (error) {
        results.showError(error.message);
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
