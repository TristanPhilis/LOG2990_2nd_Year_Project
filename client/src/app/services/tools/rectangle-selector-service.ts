import { Injectable } from '@angular/core';
import { BoundingBox } from '@app/classes/bounding-box';
import { SelectionBox } from '@app/classes/selection-box';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DASHLINE_EMPTY, DASHLINE_FULL, DEPLACEMENT, ESCAPE_KEY, NEGATIVE_MULTIPLIER, SHIFT_KEY } from '@app/shared/constant';
import { MouseButton } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class RectangleSelectorService extends Tool {
    isAreaSelected: boolean = false;
    selectedImageData: ImageData;
    shiftDown: boolean;
    selectedBox: BoundingBox;
    selectionBox: SelectionBox;
    draggingAnchorRelativePosition: Vec2;

    constructor(drawingService: DrawingService) {
        super(drawingService);

        this.selectedBox = new BoundingBox();
        this.selectionBox = new SelectionBox();
    }

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
        ctx.strokeStyle = '#111155';
        ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);
        ctx.rect(this.selectedBox.position.x, this.selectedBox.position.y, this.selectedBox.width, this.selectedBox.height);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    private drawSelectionBox(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        const ctx = this.drawingService.previewCtx;
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
        this.drawingService.fillCanvas('white', this.selectedBox);
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
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === SHIFT_KEY) {
            this.shiftDown = true;
            if (this.mouseDown && !this.isAreaSelected) {
                this.drawSelectionBox();
            }
        } else if (this.isAreaSelected) {
            if (event.key === 'ArrowDown') {
                this.selectedBox.translateY(DEPLACEMENT);
                this.updateSelectedAreaPreview();
            }
            if (event.key === 'ArrowUp') {
                this.selectedBox.translateY(DEPLACEMENT * NEGATIVE_MULTIPLIER);
                this.updateSelectedAreaPreview();
            }
            if (event.key === 'ArrowLeft') {
                this.selectedBox.translateX(DEPLACEMENT * NEGATIVE_MULTIPLIER);
                this.updateSelectedAreaPreview();
            }
            if (event.key === 'ArrowRight') {
                this.selectedBox.translateX(DEPLACEMENT);
                this.updateSelectedAreaPreview();
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

    // private selectArea(ctx: CanvasRenderingContext2D): void {
    //     this.drawingService.clearCanvas(this.drawingService.previewCtx);
    //     ctx.beginPath();

    //     const width = this.mouseDownCoord.x - this.initialCoord.x;
    //     const height = this.mouseDownCoord.y - this.initialCoord.y;

    //     ctx.strokeStyle = '#111155';

    //     ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);
    //     if (this.shiftDown) {
    //         const squareSize = Math.min(Math.abs(width), Math.abs(height));
    //         this.savedHeight = squareSize * Math.sign(height);
    //         this.savedWidth = squareSize * Math.sign(width);
    //         ctx.rect(this.initialCoord.x, this.initialCoord.y, squareSize * Math.sign(width), squareSize * Math.sign(height));
    //     } else {
    //         this.savedHeight = height;
    //         this.savedWidth = width;
    //         ctx.rect(this.initialCoord.x, this.initialCoord.y, width, height);
    //     }

    //     ctx.stroke();
    //     ctx.setLineDash([]);

    //     if (this.savedWidth > 0) {
    //         this.imageLocation.x = this.initialCoord.x;
    //     } else {
    //         this.imageLocation.x = this.mouseDownCoord.x;
    //     }
    //     if (this.savedHeight > 0){
    //         this.imageLocation.y = this.initialCoord.y;
    //     } else {
    //         this.imageLocation.y = this.mouseDownCoord.y;
    //     }
    // }

    // private moveSelectionWithMouse(currentMouseCoord: Vec2): void {
    //     this.drawingService.clearCanvas(this.drawingService.previewCtx);

    //     this.imageLocation.x = this.mouseDownCoord.x - Math.abs(this.savedWidth / 2);
    //     this.imageLocation.y = this.mouseDownCoord.y - Math.abs(this.savedHeight / 2);

    //     ctx.putImageData(this.selectedImageData, this.imageLocation.x, this.imageLocation.y);

    //     ctx.beginPath();
    //     ctx.strokeStyle = '#111155';

    //     ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);

    //     ctx.rect(this.imageLocation.x, this.imageLocation.y, Math.abs(this.savedWidth), Math.abs(this.savedHeight));

    //     ctx.stroke();
    //     ctx.setLineDash([]);
    // }

    // private moveSelectionWithArrows(ctx: CanvasRenderingContext2D): void {
    //     this.drawingService.clearCanvas(this.drawingService.previewCtx);

    //     ctx.putImageData(this.selectedImageData, this.imageLocation.x, this.imageLocation.y);

    //     ctx.beginPath();
    //     ctx.strokeStyle = '#111155';

    //     ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);

    //     ctx.rect(this.imageLocation.x, this.imageLocation.y, Math.abs(this.savedWidth), Math.abs(this.savedHeight));

    //     ctx.stroke();
    //     ctx.setLineDash([]);
    // }
}
