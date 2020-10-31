import { Vec2 } from './vec2';

export class SelectionBox {
    anchor: Vec2;
    opposingCorner: Vec2;

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

    get squarePosition(): Vec2 {
        const xSign = Math.sign(this.opposingCorner.x - this.anchor.x);
        const ySign = Math.sign(this.opposingCorner.y - this.anchor.y);
        return {
            x: this.anchor.x < this.opposingCorner.x ? this.anchor.x : this.anchor.x + this.squareSize * xSign,
            y: this.anchor.y < this.opposingCorner.y ? this.anchor.y : this.anchor.y + this.squareSize * ySign,
        };
    }

    get squareSize(): number {
        return Math.min(this.width, this.heigth);
    }

    get width(): number {
        return Math.abs(this.anchor.x - this.opposingCorner.x);
    }

    get heigth(): number {
        return Math.abs(this.anchor.y - this.opposingCorner.y);
    }
}
