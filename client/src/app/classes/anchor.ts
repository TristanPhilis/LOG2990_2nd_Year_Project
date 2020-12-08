import { Box } from './box';
import { Vec2 } from './vec2';

export const ANCHOR_SIZE = 10;

export class Anchor extends Box {
    centerCoord: Vec2;

    constructor(x: number, y: number) {
        super();
        this.centerCoord = { x, y };
    }

    translateX(distance: number): void {
        this.centerCoord.x += distance;
    }

    translateY(distance: number): void {
        this.centerCoord.y += distance;
    }

    isInBox(coord: Vec2): boolean {
        const xIsValid = coord.x > this.position.x && coord.x < this.position.x + this.width;
        const yIsValid = coord.y > this.position.y && coord.y < this.position.y + this.height;
        return xIsValid && yIsValid;
    }

    get position(): Vec2 {
        return {
            x: this.centerCoord.x - this.width / 2,
            y: this.centerCoord.y - this.width / 2,
        };
    }

    get width(): number {
        return ANCHOR_SIZE;
    }

    get height(): number {
        return ANCHOR_SIZE;
    }

    get center(): Vec2 {
        return this.centerCoord;
    }
}
