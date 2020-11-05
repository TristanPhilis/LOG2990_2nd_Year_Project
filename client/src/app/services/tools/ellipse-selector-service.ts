import { Injectable } from '@angular/core';
import { BoundingBox } from '@app/classes/bounding-box';
import { SelectionBox } from '@app/classes/selection-box';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import {
    ARROW_DOWN,
    ARROW_LEFT,
    ARROW_RIGHT,
    ARROW_UP,
    DASHLINE_EMPTY,
    DASHLINE_FULL,
    DEPLACEMENT,
    ESCAPE_KEY,
    NEGATIVE_MULTIPLIER,
    SELECTION_BOX_BORDER_SIZE,
    SELECTION_BOX_COLOUR
    SHIFT_KEY,
} from '@app/shared/constant';
import { MouseButton } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class EllipseSelectorService extends Tool {
    constructor(drawingService: DrawingService) {
        super(drawingService);

        this.selectedBox = new BoundingBox();
        this.selectionBox = new SelectionBox();
        this.isAreaSelected = false;
        this.wasItCircle = false;
    }
    isAreaSelected: boolean;
    selectedImageData: ImageData;
    shiftDown: boolean;
    selectedBox: BoundingBox;
    selectionBox: SelectionBox;
    draggingAnchorRelativePosition: Vec2;
    keyMap: boolean[] = [];
    savedXMiddle: number;
    savedYMiddle: number;
    savedXRadius: number;
    savedYRadius: number;
    wasItCircle: boolean;

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            const currentCoord = this.getPositionFromMouse(event);
            if (this.isAreaSelected) {
                if (this.selectedBox.isInBox(currentCoord)) {
                    this.draggingAnchorRelativePosition = {
                        x: currentCoord.x - this.selectedBox.position.x,
                        y: currentCoord.y - this.selectedBox.position.y,
                    };
                } else {
                    this.placeImage();
                    this.initializeSelectionBox(currentCoord);
                }
            } else {
                this.initializeSelectionBox(currentCoord);
            }
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            if (!this.isAreaSelected) {
                this.initializeSelectedBox();
            }
            this.mouseDown = false;
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && event.buttons === MouseButton.Left && !this.isAreaSelected) {
            const currentCoord = this.getPositionFromMouse(event);
            this.selectionBox.updateOpposingCorner(currentCoord);
            this.drawSelectionBox();
        }

        if (this.mouseDown && !(event.buttons === MouseButton.Left) && !this.isAreaSelected) {
            this.initializeSelectedBox();
            this.mouseDown = false;
        }

        if (this.mouseDown && event.buttons === MouseButton.Left && this.isAreaSelected) {
            const currentCoord = this.getPositionFromMouse(event);
            this.translateSelectedBoxFromMouseMove(currentCoord);
            this.updateSelectedAreaPreview();
        }
    }

    private initializeSelectionBox(coord: Vec2): void {
        this.selectionBox.setAnchor(coord);
        this.selectionBox.updateOpposingCorner(coord);
    }

    private initializeSelectedBox(): void {
        this.selectedBox.updateFromSelectionBox(this.selectionBox, this.shiftDown);
        this.isAreaSelected = this.selectedBox.width > 0 && this.selectedBox.height > 0;
        if (this.isAreaSelected) {
            this.copyArea(this.drawingService.baseCtx);
            this.updateSelectedAreaPreview();
        }
    }

    private drawSelectedBox(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        const ctx = this.drawingService.previewCtx;
        ctx.beginPath();
        const selectionBoxColour = SELECTION_BOX_COLOUR;
        ctx.strokeStyle = selectionBoxColour;
        ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);
        ctx.rect(this.selectedBox.position.x, this.selectedBox.position.y, this.selectedBox.width, this.selectedBox.height);
        ctx.stroke();
        ctx.setLineDash([]);
        const buttonSize = 5;
        ctx.beginPath();
        ctx.arc(this.selectedBox.left, this.selectedBox.top, buttonSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.selectedBox.right, this.selectedBox.top, buttonSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.selectedBox.left, this.selectedBox.bottom, buttonSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.selectedBox.right, this.selectedBox.bottom, buttonSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc((this.selectedBox.left + this.selectedBox.right) / 2, this.selectedBox.top, buttonSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.selectedBox.right, (this.selectedBox.top + this.selectedBox.bottom) / 2, buttonSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc((this.selectedBox.left + this.selectedBox.right) / 2, this.selectedBox.bottom, buttonSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.selectedBox.right, (this.selectedBox.top + this.selectedBox.bottom) / 2, buttonSize, 0, 2 * Math.PI);
        ctx.fill();
    }

    private drawSelectionBox(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        const ctx = this.drawingService.previewCtx;
        this.savedXRadius = this.selectionBox.width / 2;
        this.savedYRadius = this.selectionBox.height / 2;
        ctx.beginPath();
        ctx.lineWidth = SELECTION_BOX_BORDER_SIZE;
        const selectionBoxColour = SELECTION_BOX_COLOUR;
        ctx.strokeStyle = selectionBoxColour;
        ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);

        if (this.shiftDown) {
            const smallestRadius = Math.min(Math.abs(this.savedXRadius), Math.abs(this.savedYRadius));
            this.savedXMiddle = this.selectionBox.squarePosition.x + smallestRadius * Math.sign(this.savedXRadius);
            this.savedYMiddle = this.selectionBox.squarePosition.y + smallestRadius * Math.sign(this.savedYRadius);
            ctx.arc(this.savedXMiddle, this.savedYMiddle, smallestRadius, 0, 2 * Math.PI);
            this.wasItCircle = true;
        } else {
            this.savedXMiddle = this.selectionBox.position.x + this.savedXRadius;
            this.savedYMiddle = this.selectionBox.position.y + this.savedYRadius;
            ctx.ellipse(this.savedXMiddle, this.savedYMiddle, this.savedXRadius, this.savedYRadius, 0, 0, 2 * Math.PI);
            this.wasItCircle = false;
        }

        ctx.stroke();
        ctx.setLineDash([]);
    }

    private clearBaseCanvasSelectedArea(): void {
        this.drawingService.baseCtx.beginPath();
        if (this.wasItCircle) {
            const smallestRadius = Math.min(Math.abs(this.savedXRadius), Math.abs(this.savedYRadius));
            this.drawingService.baseCtx.arc(this.savedXMiddle, this.savedYMiddle, smallestRadius, 0, 2 * Math.PI);
        } else {
            this.drawingService.baseCtx.ellipse(this.savedXMiddle, this.savedYMiddle, this.savedXRadius, this.savedYRadius, 0, 0, 2 * Math.PI);
        }
        this.drawingService.baseCtx.fillStyle = 'white';
        this.drawingService.baseCtx.fill();
    }

    private translateSelectedBoxFromMouseMove(coord: Vec2): void {
        const distanceFromLeft = coord.x - this.selectedBox.left;
        const xTranslate = distanceFromLeft - this.draggingAnchorRelativePosition.x;
        this.selectedBox.translateX(xTranslate);
        const distanceFromTop = coord.y - this.selectedBox.top;
        const yTranslate = distanceFromTop - this.draggingAnchorRelativePosition.y;
        this.selectedBox.translateY(yTranslate);
    }

    private updateSelectedAreaPreview(): void {
        this.drawingService.previewCtx.save();
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawSelectedBox();
        const ellipsePath = new Path2D();
        if (this.wasItCircle) {
            const smallestRadius = Math.min(Math.abs(this.savedXRadius), Math.abs(this.savedYRadius));
            ellipsePath.arc(
                this.selectedBox.position.x + this.selectedBox.width / 2,
                this.selectedBox.position.y + this.selectedBox.height / 2,
                smallestRadius,
                0,
                2 * Math.PI,
            );
        } else {
            ellipsePath.ellipse(
                this.selectedBox.position.x + this.selectedBox.width / 2,
                this.selectedBox.position.y + this.selectedBox.height / 2,
                this.savedXRadius,
                this.savedYRadius,
                0,
                0,
                2 * Math.PI,
            );
        }
        this.drawingService.previewCtx.clip(ellipsePath);
        this.drawingService.previewCtx.drawImage(
            this.imagedata_to_image(this.selectedImageData),
            this.selectedBox.position.x,
            this.selectedBox.position.y,
        );
        this.drawingService.previewCtx.restore();
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === ESCAPE_KEY) {
            this.placeImage();
        }
        if (event.key === SHIFT_KEY) {
            this.shiftDown = false;
            if (this.mouseDown && !this.isAreaSelected) {
                this.drawSelectionBox();
            }
        }
        event = event || event;
        // tslint:disable-next-line: deprecation
        this.keyMap[event.keyCode] = event.type === 'keydown';
    }

    onKeyDown(event: KeyboardEvent): void {
        event = event || event;
        // Need to use keyCode to travel in the keyMap
        // tslint:disable-next-line: deprecation
        this.keyMap[event.keyCode] = event.type === 'keydown';

        if (event.key === SHIFT_KEY) {
            this.shiftDown = true;
            if (this.mouseDown && !this.isAreaSelected) {
                this.drawSelectionBox();
            }
        } else if (this.isAreaSelected) {
            if (this.keyMap[ARROW_DOWN]) {
                this.selectedBox.translateY(DEPLACEMENT);
                this.updateSelectedAreaPreview();
            }
            if (this.keyMap[ARROW_UP]) {
                this.selectedBox.translateY(DEPLACEMENT * NEGATIVE_MULTIPLIER);
                this.updateSelectedAreaPreview();
            }
            if (this.keyMap[ARROW_LEFT]) {
                this.selectedBox.translateX(DEPLACEMENT * NEGATIVE_MULTIPLIER);
                this.updateSelectedAreaPreview();
            }
            if (this.keyMap[ARROW_RIGHT]) {
                this.selectedBox.translateX(DEPLACEMENT);
                this.updateSelectedAreaPreview();
            }
        }
    }

    placeImage(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.isAreaSelected) {
            const ctx = this.drawingService.baseCtx;
            const ellipsePath = new Path2D();
            if (this.wasItCircle) {
                const smallestRadius = Math.min(Math.abs(this.savedXRadius), Math.abs(this.savedYRadius));
                ellipsePath.arc(
                    this.selectedBox.position.x + this.selectedBox.width / 2,
                    this.selectedBox.position.y + this.selectedBox.height / 2,
                    smallestRadius,
                    0,
                    2 * Math.PI,
                );
            } else {
                ellipsePath.ellipse(
                    this.selectedBox.position.x + this.selectedBox.width / 2,
                    this.selectedBox.position.y + this.selectedBox.height / 2,
                    this.savedXRadius,
                    this.savedYRadius,
                    0,
                    0,
                    2 * Math.PI,
                );
            }
            ctx.save();
            ctx.clip(ellipsePath);
            ctx.drawImage(this.imagedata_to_image(this.selectedImageData), this.selectedBox.position.x, this.selectedBox.position.y);
            ctx.restore();
        }
        this.isAreaSelected = false;
        this.selectedImageData = { data: new Uint8ClampedArray(), width: 0, height: 0 };
    }

    private copyArea(ctx: CanvasRenderingContext2D): void {
        this.selectedImageData = ctx.getImageData(
            this.selectedBox.position.x,
            this.selectedBox.position.y,
            this.selectedBox.width,
            this.selectedBox.height,
        );
        this.clearBaseCanvasSelectedArea();
        this.updateSelectedAreaPreview();
    }

    private imagedata_to_image(imagedata: ImageData): CanvasImageSource {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = imagedata.width;
        canvas.height = imagedata.height;
        // tslint:disable-next-line: no-non-null-assertion
        ctx!.putImageData(imagedata, 0, 0);
        const image = new Image();
        image.src = canvas.toDataURL();
        return image;
    }
}
