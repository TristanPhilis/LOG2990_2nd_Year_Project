import { DEG_TO_RAD_FACTOR } from '@app/shared/constant';
import { AnchorsPosition } from '@app/shared/enum';
import { Anchor } from './anchor';
import { BoundingBox } from './bounding-box';
import { Box } from './box';
import { SelectionBox } from './selection-box';
import { Vec2 } from './vec2';

export class SelectedBox extends Box {
    top: number;
    bottom: number;
    left: number;
    right: number;
    mouseCoord: Vec2;
    anchors: Map<AnchorsPosition, Anchor>;
    angle: number;
    rotationCenter: Vec2;
    boundingBox: BoundingBox;

    constructor() {
        super();
        this.top = 0;
        this.bottom = 0;
        this.left = 0;
        this.right = 0;
        this.angle = 0;
        this.boundingBox = new BoundingBox();
        this.rotationCenter = { x: 0, y: 0 };
        this.initializeAnchors();
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
        this.rotationCenter = this.center;
        this.angle = 0;
        this.initializeAnchors();
        this.boundingBox.updateFromSelectionBox(selectionBox, isSquare);
    }

    refreshBoundingBox(): void {
        this.boundingBox.setStartingCoord(this.center);
        this.anchors.forEach((anchor: Anchor) => {
            const coord = this.getAngleAdjustedCoord(anchor.centerCoord);
            this.boundingBox.update(coord);
        });
    }

    translateX(distance: number): void {
        this.right += distance;
        this.left += distance;
        this.rotationCenter.x += distance;
        this.anchors.forEach((anchor: Anchor) => {
            anchor.translateX(distance);
        });
        if (this.mouseCoord) {
            this.mouseCoord.x += distance;
        }
    }

    translateY(distance: number): void {
        this.top += distance;
        this.bottom += distance;
        this.rotationCenter.y += distance;
        this.anchors.forEach((anchor: Anchor) => {
            anchor.translateY(distance);
        });
        if (this.mouseCoord) {
            this.mouseCoord.y += distance;
        }
    }

    isInBox(coord: Vec2): boolean {
        const xIsValid = coord.x > Math.min(this.left, this.right) && coord.x < Math.max(this.right, this.left);
        const yIsValid = coord.y > Math.min(this.top, this.bottom) && coord.y < Math.max(this.top, this.bottom);
        return xIsValid && yIsValid;
    }

    initializeAnchors(): void {
        this.anchors = new Map<AnchorsPosition, Anchor>()
            .set(AnchorsPosition.topLeft, new Anchor(this.left, this.top))
            .set(AnchorsPosition.middleTop, new Anchor(this.center.x, this.top))
            .set(AnchorsPosition.topRight, new Anchor(this.right, this.top))
            .set(AnchorsPosition.middleLeft, new Anchor(this.left, this.center.y))
            .set(AnchorsPosition.middleRight, new Anchor(this.right, this.center.y))
            .set(AnchorsPosition.bottomLeft, new Anchor(this.left, this.bottom))
            .set(AnchorsPosition.middleBottom, new Anchor(this.center.x, this.bottom))
            .set(AnchorsPosition.bottomRight, new Anchor(this.right, this.bottom));
    }

    getAnchorCoord(anchor: AnchorsPosition): Vec2 {
        let coord: Vec2;
        if (anchor === AnchorsPosition.center) {
            coord = this.center;
        } else {
            const anchorBox = this.anchors.get(anchor) as Anchor;
            coord = anchorBox.centerCoord;
        }
        return this.getAngleAdjustedCoord(coord);
    }

    // https://love2d.org/forums/viewtopic.php?t=11585#:~:text=To%20find%20if%20a%20point,inside%20the%20corresponding%20unrotated%20rectangle.
    getAngleAdjustedCoord(coord: Vec2, reverseAngle?: boolean): Vec2 {
        const angle = reverseAngle ? -this.radAngle : this.radAngle;
        const distanceVector = {
            x: coord.x - this.rotationCenter.x,
            y: coord.y - this.rotationCenter.y,
        };
        const adjustedDistanceVector = {
            x: distanceVector.x * Math.cos(angle) - distanceVector.y * Math.sin(angle),
            y: distanceVector.x * Math.sin(angle) + distanceVector.y * Math.cos(angle),
        };
        return {
            x: this.rotationCenter.x + adjustedDistanceVector.x,
            y: this.rotationCenter.y + adjustedDistanceVector.y,
        };
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

    get center(): Vec2 {
        return {
            x: this.left + this.width / 2,
            y: this.top + this.height / 2,
        };
    }

    get radAngle(): number {
        return this.angle * DEG_TO_RAD_FACTOR;
    }

    copy(): SelectedBox {
        const copy = new SelectedBox();
        copy.top = this.top;
        copy.left = this.left;
        copy.right = this.right;
        copy.bottom = this.bottom;
        copy.angle = this.angle;
        copy.rotationCenter = this.rotationCenter;
        return copy;
    }
}
