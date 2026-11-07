import { randomFaceSrc } from "../dice.js";

// How often the face changes while the die is tumbling.
const TUMBLE_INTERVAL_MS = 70;

// Fast at first, then a long slow-down as the die skids to a stop.
const ROLL_EASING = "cubic-bezier(0.15, 0.7, 0.3, 1)";

function transform({ x, y }, angle, scale) {
    return `translate(${x}px, ${y}px) rotate(${angle}deg) scale(${scale})`;
}

/**
 * One die on the board. It tumbles through random faces while it travels,
 * then lands showing its rolled face.
 */
export class RollingDie {
    #tumbleTimer = null;
    #animation = null;

    constructor({ die, src, alt }, critClass, size) {
        this.die = die;
        this.finalSrc = src;
        this.critClass = critClass;

        this.image = document.createElement("img");
        this.image.alt = alt;
        this.image.draggable = false;
        this.image.src = randomFaceSrc(die);

        this.element = document.createElement("div");
        this.element.className = "rolling-die";
        this.element.style.width = `${size}px`;
        this.element.style.height = `${size}px`;
        this.element.append(this.image);
    }

    /**
     * Throw the die along a path: { start, bounce, end, finalAngle, spin, duration, delay }.
     * Positions are the die's top-left corner in board pixels.
     */
    async roll({ start, bounce, end, finalAngle, spin, duration, delay }) {
        const keyframes = [
            { offset: 0, transform: transform(start, finalAngle - spin, 1.3) },
            { offset: 0.55, transform: transform(bounce, finalAngle - spin * 0.15, 0.95) },
            { offset: 1, transform: transform(end, finalAngle, 1) },
        ];

        this.#tumbleTimer = setInterval(() => {
            this.image.src = randomFaceSrc(this.die);
        }, TUMBLE_INTERVAL_MS);

        this.#animation = this.element.animate(keyframes, {
            duration,
            delay,
            easing: ROLL_EASING,
            fill: "forwards",
        });

        try {
            await this.#animation.finished;
        } catch {
            return; // stopped by a newer roll
        }

        this.#land();
    }

    // Put the die straight in its final spot, with no animation.
    place(end, finalAngle) {
        this.element.style.transform = transform(end, finalAngle, 1);
        this.#land();
    }

    stop() {
        clearInterval(this.#tumbleTimer);
        this.#animation?.cancel();
        this.element.remove();
    }

    #land() {
        clearInterval(this.#tumbleTimer);
        this.image.src = this.finalSrc;
        this.element.classList.add("landed");
        if (this.critClass) {
            this.element.classList.add(this.critClass);
        }
    }
}
