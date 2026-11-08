import {
    Component,
    ElementRef,
    OnDestroy,
    afterNextRender,
    inject,
    input,
    linkedSignal,
    signal,
} from "@angular/core";

import { randomFaceSrc } from "../dice";
import { CritClass, DieFace } from "../rolls/die-roll";
import { Point, RollPath } from "./roll-path";

// How often the face changes while the die is tumbling.
const TUMBLE_INTERVAL_MS = 70;

// Fast at first, then a long slow-down as the die skids to a stop.
const ROLL_EASING = "cubic-bezier(0.15, 0.7, 0.3, 1)";

function transform({ x, y }: Point, angle: number, scale: number): string {
    return `translate(${x}px, ${y}px) rotate(${angle}deg) scale(${scale})`;
}

/**
 * One die on the board. It tumbles through random faces while it travels,
 * then lands showing its rolled face.
 */
@Component({
    selector: "app-rolling-die",
    templateUrl: "./rolling-die.html",
    styleUrl: "./rolling-die.css",
    host: {
        class: "rolling-die",
        "[class.landed]": "landed()",
        "[class.crit]": "landed() && critClass() === 'crit'",
        "[class.fumble]": "landed() && critClass() === 'fumble'",
        "[class.discarded]": "landed() && !!face().discarded",
        "[style.width.px]": "size()",
        "[style.height.px]": "size()",
    },
})
export class RollingDie implements OnDestroy {
    readonly face = input.required<DieFace>();
    readonly path = input.required<RollPath>();
    readonly size = input.required<number>();
    readonly critClass = input<CritClass>("");
    readonly animate = input(true);

    // Starts on a random face; switches to the real one on landing.
    protected readonly src = linkedSignal(() => randomFaceSrc(this.face().die));
    protected readonly landed = signal(false);

    private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
    private tumbleTimer?: ReturnType<typeof setInterval>;
    private animation?: Animation;

    constructor() {
        afterNextRender(() => this.start());
    }

    ngOnDestroy(): void {
        clearInterval(this.tumbleTimer);
        this.animation?.cancel();
    }

    private start(): void {
        const { start, bounce, end, finalAngle, spin, duration, delay } = this.path();

        if (!this.animate()) {
            this.host.nativeElement.style.transform = transform(end, finalAngle, 1);
            this.land();
            return;
        }

        this.tumbleTimer = setInterval(() => {
            this.src.set(randomFaceSrc(this.face().die));
        }, TUMBLE_INTERVAL_MS);

        this.animation = this.host.nativeElement.animate(
            [
                { offset: 0, transform: transform(start, finalAngle - spin, 1.3) },
                { offset: 0.55, transform: transform(bounce, finalAngle - spin * 0.15, 0.95) },
                { offset: 1, transform: transform(end, finalAngle, 1) },
            ],
            { duration, delay, easing: ROLL_EASING, fill: "forwards" },
        );

        // Cancelled animations (a newer roll) reject; nothing to do then.
        this.animation.finished.then(
            () => this.land(),
            () => undefined,
        );
    }

    private land(): void {
        clearInterval(this.tumbleTimer);
        this.src.set(this.face().src);
        this.landed.set(true);
    }
}
