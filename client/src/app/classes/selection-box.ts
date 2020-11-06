import { Box } from './box';
import { Vec2 } from './vec2';

export class SelectionBox extends Box {
    private anchor: Vec2;
    private opposingCorner: Vec2;

    constructor() {
        super();
        this.anchor = { x: 0, y: 0 };
        this.opposingCorner = { x: 0, y: 0 };
    }

    setAnchor(coord: Vec2): void {
        this.anchor = coord;
    }

    updateOpposingCorner(coord: Vec2): void {
        this.opposingCorner = coord;
    }

    get position(): Vec2 {
        return {
            x: Math.min(this.anchor.x, this.opposingCorner.x),
            y: Math.min(this.anchor.y, this.opposingCorner.y),
        };
    }

    get center(): Vec2 {
        return {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2,
        };
    }

    get squareCenter(): Vec2 {
        return {
            x: this.squarePosition.x + this.circleRadius,
            y: this.squarePosition.y + this.circleRadius,
        };
    }

    get circleRadius(): number {
        return this.squareSize / 2;
    }

    get squarePosition(): Vec2 {
        const xSign = Math.sign(this.opposingCorner.x - this.anchor.x);
        const ySign = Math.sign(this.opposingCorner.y - this.anchor.y);
        return {
            x: this.anchor.x < this.opposingCorner.x ? this.anchor.x : this.anchor.x + this.squareSize * xSign,
            y: this.anchor.y < this.opposingCorner.y ? this.anchor.y : this.anchor.y + this.squareSize * ySign,
        };
    }

    get squareSize(): number {
        return Math.min(this.width, this.height);
    }

    get width(): number {
        return Math.abs(this.anchor.x - this.opposingCorner.x);
    }

    get height(): number {
        return Math.abs(this.anchor.y - this.opposingCorner.y);
    }
}
