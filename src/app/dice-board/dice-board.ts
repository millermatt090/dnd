import { Component, ElementRef, inject, signal } from "@angular/core";

import { allFaceSrcs } from "../dice";
import { CritClass, DieFace } from "../rolls/die-roll";
import { RollResult } from "../rolls/roll-result";
import { RollingDie } from "../rolling-die/rolling-die";
import { Point, RollPath } from "../rolling-die/roll-path";

// The felt area inside the board image's wooden frame, as a fraction of the board size.
const FELT_INSET = { x: 0.05, y: 0.08 };

// Die size in pixels: as large as BASE, never smaller than MIN.
const DIE_SIZE = { base: 84, min: 44 };

// Random positions tried per die when looking for a spot that doesn't overlap another die.
const PLACEMENT_ATTEMPTS = 40;

interface BoardDie {
    id: number;
    face: DieFace;
    critClass: CritClass;
    size: number;
    path: RollPath;
}

interface Bounds {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

function between(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

/**
 * The felt board. Each roll throws the dice in from the left; they tumble,
 * bounce and come to rest showing their results.
 */
@Component({
    selector: "app-dice-board",
    imports: [RollingDie],
    templateUrl: "./dice-board.html",
    styleUrl: "./dice-board.css",
})
export class DiceBoard {
    protected readonly dice = signal<BoardDie[]>([]);
    protected readonly message = signal<string | null>("Pick some dice and press Roll");
    protected readonly status = signal("");
    protected readonly animate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
    private nextId = 0;

    constructor() {
        // Load every face up front so tumbling dice don't flicker.
        allFaceSrcs().forEach((src) => {
            new Image().src = src;
        });
    }

    throw(result: RollResult): void {
        const faces = result.rolls.flatMap((roll) =>
            roll.faces().map((face) => ({ face, critClass: roll.critClass })),
        );
        const size = this.dieSize(faces.length);
        const spots = this.pickSpots(faces.length, size);

        // New ids replace every die component, which stops any roll still in progress.
        this.dice.set(
            faces.map(({ face, critClass }, index) => ({
                id: this.nextId++,
                face,
                critClass,
                size,
                path: this.path(spots[index], size, index),
            })),
        );

        this.message.set(null);
        this.status.set(`Rolled ${result.describe()}`);
    }

    showError(message: string): void {
        this.dice.set([]);
        this.message.set(message);
    }

    private dieSize(count: number): number {
        const crowding = count > 12 ? 0.6 : count > 6 ? 0.8 : 1;
        const fitted = Math.min(DIE_SIZE.base, this.host.nativeElement.clientWidth * 0.13);
        return Math.max(DIE_SIZE.min, fitted * crowding);
    }

    // Range of top-left positions that keep a die fully on the felt.
    private feltBounds(size: number): Bounds {
        const { clientWidth: width, clientHeight: height } = this.host.nativeElement;

        return {
            left: width * FELT_INSET.x,
            top: height * FELT_INSET.y,
            right: width * (1 - FELT_INSET.x) - size,
            bottom: height * (1 - FELT_INSET.y) - size,
        };
    }

    private pickSpots(count: number, size: number): Point[] {
        const bounds = this.feltBounds(size);
        const minGap = size * 1.1;
        const spots: Point[] = [];

        const randomSpot = (): Point => ({
            x: between(bounds.left, bounds.right),
            y: between(bounds.top, bounds.bottom),
        });
        const isClear = (spot: Point): boolean =>
            spots.every((other) => Math.hypot(other.x - spot.x, other.y - spot.y) >= minGap);

        Array.from({ length: count }).forEach(() => {
            const candidates = Array.from({ length: PLACEMENT_ATTEMPTS }, randomSpot);
            spots.push(candidates.find(isClear) ?? candidates[0]);
        });

        return spots;
    }

    // Thrown in from the left edge, overshooting its resting spot before skidding back.
    private path(end: Point, size: number, index: number): RollPath {
        const bounds = this.feltBounds(size);
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
