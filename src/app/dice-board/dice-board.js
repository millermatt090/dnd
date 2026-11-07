import { allFaceSrcs } from "../dice.js";
import { RollingDie } from "./rolling-die.js";

// The felt area inside the board image's wooden frame, as a fraction of the board size.
const FELT_INSET = { x: 0.05, y: 0.08 };

// Die size in pixels: as large as BASE, never smaller than MIN.
const DIE_SIZE = { base: 84, min: 44 };

// Random positions tried per die when looking for a spot that doesn't overlap another die.
const PLACEMENT_ATTEMPTS = 40;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function between(min, max) {
    return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

/**
 * The felt board. Each roll throws the dice in from the left; they tumble,
 * bounce and come to rest showing their results.
 */
export class DiceBoard {
    #dice = [];

    constructor({ board, message, status }) {
        this.board = board;
        this.message = message;
        this.status = status;

        // Load every face up front so tumbling dice don't flicker.
        allFaceSrcs().forEach((src) => {
            new Image().src = src;
        });
    }

    throw(result) {
        this.clear();
        this.message.hidden = true;

        const faces = result.rolls.flatMap((roll) =>
            roll.faces().map((face) => ({ face, critClass: roll.critClass })),
        );
        const size = this.#dieSize(faces.length);
        const spots = this.#pickSpots(faces.length, size);

        this.#dice = faces.map(({ face, critClass }) => new RollingDie(face, critClass, size));
        this.board.append(...this.#dice.map((die) => die.element));

        this.#dice.forEach((die, index) => {
            const path = this.#path(spots[index], size, index);

            if (reducedMotion.matches) {
                die.place(path.end, path.finalAngle);
            } else {
                die.roll(path);
            }
        });

        // Read out by screen readers; not shown on screen.
        this.status.textContent = `Rolled ${result.describe()}`;
    }

    showError(message) {
        this.clear();
        this.message.textContent = message;
        this.message.hidden = false;
    }

    clear() {
        this.#dice.forEach((die) => die.stop());
        this.#dice = [];
    }

    #dieSize(count) {
        const crowding = count > 12 ? 0.6 : count > 6 ? 0.8 : 1;
        const fitted = Math.min(DIE_SIZE.base, this.board.clientWidth * 0.13);
        return Math.max(DIE_SIZE.min, fitted * crowding);
    }

    // Range of top-left positions that keep a die fully on the felt.
    #feltBounds(size) {
        const width = this.board.clientWidth;
        const height = this.board.clientHeight;

        return {
            left: width * FELT_INSET.x,
            top: height * FELT_INSET.y,
            right: width * (1 - FELT_INSET.x) - size,
            bottom: height * (1 - FELT_INSET.y) - size,
        };
    }

    #pickSpots(count, size) {
        const bounds = this.#feltBounds(size);
        const minGap = size * 1.1;
        const spots = [];

        const randomSpot = () => ({
            x: between(bounds.left, bounds.right),
            y: between(bounds.top, bounds.bottom),
        });
        const isClear = (spot) =>
            spots.every((other) => Math.hypot(other.x - spot.x, other.y - spot.y) >= minGap);

        Array.from({ length: count }).forEach(() => {
            const candidates = Array.from({ length: PLACEMENT_ATTEMPTS }, randomSpot);
            spots.push(candidates.find(isClear) ?? candidates[0]);
        });

        return spots;
    }

    // Thrown in from the left edge, overshooting its resting spot before skidding back.
    #path(end, size, index) {
        const bounds = this.#feltBounds(size);
        const direction = Math.random() < 0.5 ? -1 : 1;

        return {
            start: {
                x: -size * 1.5,
                y: between(bounds.top, bounds.bottom),
            },
            bounce: {
                x: clamp(end.x + size * between(0.5, 1.3), bounds.left, bounds.right),
                y: clamp(end.y + size * between(-0.6, 0.6), bounds.top, bounds.bottom),
            },
            end,
            finalAngle: between(-25, 25),
            spin: direction * between(540, 900),
            duration: between(1100, 1600),
            delay: index * 60,
        };
    }
}
