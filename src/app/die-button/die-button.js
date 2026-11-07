import { dieLabel } from "../dice.js";

/**
 * One clickable die. Clicking adds it to the pool; clicking its badge
 * or right-clicking removes one. Redraws itself when the pool changes.
 */
export class DieButton {
    constructor(element, pool) {
        this.element = element;
        this.die = element.dataset.die;
        this.badge = element.querySelector(".badge");
        this.pool = pool;

        this.badge.title = `Remove one ${dieLabel(this.die)}`;
        this.#bindEvents();
        pool.onChange(() => this.render());
        this.render();
    }

    #bindEvents() {
        this.element.addEventListener("click", (event) => {
            if (event.target === this.badge) {
                this.pool.remove(this.die);
            } else {
                this.pool.add(this.die);
            }
        });

        this.element.addEventListener("contextmenu", (event) => {
            event.preventDefault();
            this.pool.remove(this.die);
        });
    }

    render() {
        const count = this.pool.count(this.die);

        this.badge.textContent = count;
        this.element.classList.toggle("selected", count > 0);
        this.element.disabled = this.pool.isFull && count === 0;
    }
}
