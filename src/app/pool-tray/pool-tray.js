/**
 * The bar showing the selected dice, with the Roll and Clear buttons.
 */
export class PoolTray {
    constructor({ summary, rollButton, clearButton }, pool, onRoll) {
        this.summary = summary;
        this.rollButton = rollButton;
        this.clearButton = clearButton;
        this.pool = pool;

        rollButton.addEventListener("click", onRoll);
        clearButton.addEventListener("click", () => pool.clear());
        pool.onChange(() => this.render());
        this.render();
    }

    render() {
        const empty = this.pool.isEmpty;

        this.summary.textContent = empty ? "No dice selected" : this.pool.notation();
        this.rollButton.disabled = empty;
        this.clearButton.disabled = empty;
    }
}
