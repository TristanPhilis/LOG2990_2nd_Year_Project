import { Injectable } from '@angular/core';
import { BoundingBox } from '@app/classes/bounding-box';
import { SelectionBox } from '@app/classes/selection-box';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import {
    A,
    ARROW_DOWN,
    ARROW_LEFT,
    ARROW_RIGHT,
    ARROW_UP,
    CONTROL,
    DASHLINE_EMPTY,
    DASHLINE_FULL,
    DEPLACEMENT,
    ESCAPE_KEY,
    NEGATIVE_MULTIPLIER,
    SHIFT_KEY,
    SIZE_OF_SELECTION_BOX,
} from '@app/shared/constant';
import { MouseButton } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class RectangleSelectorService extends Tool {
    constructor(drawingService: DrawingService) {
        super(drawingService);

        this.selectedBox = new BoundingBox();
        this.selectionBox = new SelectionBox();
    }
    isAreaSelected: boolean = false;
    selectedImageData: ImageData;
    shiftDown: boolean;
    selectedBox: BoundingBox;
    selectionBox: SelectionBox;
    draggingAnchorRelativePosition: Vec2;
    map: boolean[] = [];

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
        const ctx = this.drawingService.previewCtx;
        this.drawingService.clearCanvas(ctx);
        ctx.beginPath();
        ctx.strokeStyle = '#111155';
        ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);
        ctx.rect(this.selectedBox.position.x, this.selectedBox.position.y, this.selectedBox.width, this.selectedBox.height);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    private drawSelectionBox(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        const ctx = this.drawingService.previewCtx;
        ctx.lineWidth = SIZE_OF_SELECTION_BOX;
        ctx.beginPath();
        ctx.strokeStyle = '#111155';
        ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);

        if (this.shiftDown) {
            const squareSize = this.selectionBox.squareSize;
            ctx.rect(this.selectionBox.squarePosition.x, this.selectionBox.squarePosition.y, squareSize, squareSize);
        } else {
            ctx.rect(this.selectionBox.position.x, this.selectionBox.position.y, this.selectionBox.width, this.selectionBox.height);
        }

        ctx.stroke();
        ctx.setLineDash([]);
    }

    private clearBaseCanvasSelectedArea(): void {
        this.drawingService.fillCanvas('white');
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
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.drawSelectedBox();
        this.drawingService.previewCtx.putImageData(this.selectedImageData, this.selectedBox.position.x, this.selectedBox.position.y);
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
        event = event || event; // to deal with IE
        // tslint:disable-next-line: deprecation
        this.map[event.keyCode] = event.type === 'keydown';
    }

    onKeyDown(event: KeyboardEvent): void {
        event = event || event; // to deal with IE
        // tslint:disable-next-line: deprecation
        this.map[event.keyCode] = event.type === 'keydown';

        if (event.key === SHIFT_KEY) {
            this.shiftDown = true;
            if (this.mouseDown && !this.isAreaSelected) {
                this.drawSelectionBox();
            }
        } else if (this.isAreaSelected) {
            if (this.map[ARROW_DOWN]) {
                this.selectedBox.translateY(DEPLACEMENT);
                this.updateSelectedAreaPreview();
            }
            if (this.map[ARROW_UP]) {
                this.selectedBox.translateY(DEPLACEMENT * NEGATIVE_MULTIPLIER);
                this.updateSelectedAreaPreview();
            }
            if (this.map[ARROW_LEFT]) {
                this.selectedBox.translateX(DEPLACEMENT * NEGATIVE_MULTIPLIER);
                this.updateSelectedAreaPreview();
            }
            if (this.map[ARROW_RIGHT]) {
                this.selectedBox.translateX(DEPLACEMENT);
                this.updateSelectedAreaPreview();
            }
            if (this.map[CONTROL] && this.map[A]) {
                this.selectAllCanvas();
            }
        }
    }
    placeImage(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.isAreaSelected) {
            const ctx = this.drawingService.baseCtx;
            ctx.putImageData(this.selectedImageData, this.selectedBox.position.x, this.selectedBox.position.y);
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

    selectAllCanvas(): void {
        this.selectedImageData = this.drawingService.baseCtx.getImageData(0, 0, this.drawingService.canvas.width, this.drawingService.canvas.height);
        this.clearBaseCanvasSelectedArea();
        this.updateSelectedAreaPreview();
    }
}
