export interface Point {
    x: number;
    y: number;
}

// How a die travels across the board. Positions are its top-left corner in board pixels.
export interface RollPath {
    start: Point;
    bounce: Point;
    end: Point;
    finalAngle: number; // degrees the die is turned when it comes to rest
    spin: number; // degrees of rotation while travelling
    duration: number; // ms
    delay: number; // ms
}
