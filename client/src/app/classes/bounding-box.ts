import { Box } from './box';
import { SelectionBox } from './selection-box';
import { Vec2 } from './vec2';

export class BoundingBox extends Box {
    top: number;
    bottom: number;
    left: number;
    right: number;

    setStartingCoord(coord: Vec2): void {
        this.top = coord.y;
        this.bottom = coord.y;
        this.right = coord.x;
        this.left = coord.x;
    }

    updateFromSelectionBox(selectionBox: SelectionBox, isSquare: boolean): void {
        if (isSquare) {
            this.top = selectionBox.squarePosition.y;
            this.left = selectionBox.squarePosition.x;
            this.right = this.left + selectionBox.squareSize;
            this.bottom = this.top + selectionBox.squareSize;
        } else {
            this.top = selectionBox.position.y;
            this.left = selectionBox.position.x;
            this.right = this.left + selectionBox.width;
            this.bottom = this.top + selectionBox.height;
        }
    }

    update(coord: Vec2): void {
        if (coord.x < this.left) {
            this.left = coord.x;
        }
        if (coord.x > this.right) {
            this.right = coord.x;
        }
        if (coord.y < this.top) {
            this.top = coord.y;
        }
        if (coord.y > this.bottom) {
            this.bottom = coord.y;
        }
    }

    translateX(distance: number): void {
        this.right += distance;
        this.left += distance;
    }

    translateY(distance: number): void {
        this.top += distance;
        this.bottom += distance;
    }

    isInBox(coord: Vec2): boolean {
        const xIsValid = coord.x > this.left && coord.x < this.right;
        const yIsValid = coord.y > this.top && coord.y < this.bottom;
        return xIsValid && yIsValid;
    }

    get position(): Vec2 {
        return { x: this.left, y: this.top };
    }

    get width(): number {
        return this.right - this.left;
    }

    get height(): number {
        return this.bottom - this.top;
    }
}
