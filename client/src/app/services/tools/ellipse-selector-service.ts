import { Injectable } from '@angular/core';
import { BoundingBox } from '@app/classes/bounding-box';
import { DrawingAction } from '@app/classes/drawing-action';
import { SelectionBox } from '@app/classes/selection-box';
import { Tool } from '@app/classes/tool';
import { ToolOption } from '@app/classes/tool-option';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
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
    SELECTION_BOX_COLOUR,
    SHIFT_KEY,
} from '@app/shared/constant';
import { DrawingToolId, MouseButton, Options } from '@app/shared/enum';
import { UndoRedoService } from './undo-redo-service';

@Injectable({
    providedIn: 'root',
})
export class EllipseSelectorService extends Tool {
    constructor(drawingService: DrawingService, undoRedoService: UndoRedoService, colorService: ColorSelectionService) {
        super(drawingService, undoRedoService, colorService);

        this.selectedBox = new BoundingBox();
        this.selectionBox = new SelectionBox();
        this.isAreaSelected = false;
    }
    isAreaSelected: boolean;
    selectedImageData: ImageData;
    shiftDown: boolean;
    selectedBox: BoundingBox;
    selectionBox: SelectionBox;
    draggingAnchorRelativePosition: Vec2;
    keyMap: boolean[] = [];

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

    private initializeSelectionBox(coord: Vec2): void {
        this.selectionBox.setAnchor(coord);
        this.selectionBox.updateOpposingCorner(coord);
    }

    private initializeSelectedBox(): void {
        this.selectedBox.updateFromSelectionBox(this.selectionBox, this.shiftDown);
        this.selectedBox.oldSelectedBox = this.selectedBox.copy();
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
        ctx.strokeStyle = SELECTION_BOX_COLOUR;
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
        const ctx = this.drawingService.previewCtx;
        this.drawingService.clearCanvas(ctx);
        ctx.beginPath();
        ctx.lineWidth = SELECTION_BOX_BORDER_SIZE;
        ctx.strokeStyle = SELECTION_BOX_COLOUR;
        ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);

        if (this.shiftDown) {
            const center = this.selectionBox.squareCenter;
            ctx.arc(center.x, center.y, this.selectionBox.circleRadius, 0, 2 * Math.PI);
        } else {
            const center = this.selectionBox.center;
            ctx.ellipse(center.x, center.y, this.selectionBox.width / 2, this.selectionBox.height / 2, 0, 0, 2 * Math.PI);
        }
        ctx.stroke();
        ctx.setLineDash([]);
    }

    private clearBaseCanvasSelectedArea(box: BoundingBox): void {
        const ctx = this.drawingService.baseCtx;
        ctx.beginPath();
        const center = box.center;
        ctx.ellipse(center.x, center.y, box.width / 2, box.height / 2, 0, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
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
        this.clipImage(this.drawingService.previewCtx, this.selectedImageData, this.selectedBox);
    }

    private clipImage(ctx: CanvasRenderingContext2D, imageData: ImageData, box: BoundingBox): void {
        const ellipsePath = new Path2D();
        const center = box.center;
        ellipsePath.ellipse(center.x, center.y, box.width / 2, box.height / 2, 0, 0, 2 * Math.PI);
        ctx.save();
        ctx.clip(ellipsePath);
        ctx.drawImage(this.imagedata_to_image(imageData), box.position.x, box.position.y);
        ctx.restore();
    }

    placeImage(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.isAreaSelected) {
            const ctx = this.drawingService.baseCtx;
            const action = this.getDrawingAction();
            this.undoRedoService.saveAction(action);
            this.draw(ctx, action);
        }
        this.isAreaSelected = false;
        this.selectedImageData = { data: new Uint8ClampedArray(), width: 0, height: 0 };
    }

    draw(ctx: CanvasRenderingContext2D, drawingAction: DrawingAction): void {
        const box = drawingAction.box as BoundingBox;
        const imageData = drawingAction.imageData;
        if (box && imageData) {
            this.clearBaseCanvasSelectedArea(box.oldSelectedBox);
            this.clipImage(ctx, imageData, box);
        }
    }

    private copyArea(ctx: CanvasRenderingContext2D): void {
        this.selectedImageData = ctx.getImageData(
            this.selectedBox.position.x,
            this.selectedBox.position.y,
            this.selectedBox.width,
            this.selectedBox.height,
        );
        this.clearBaseCanvasSelectedArea(this.selectedBox);
        this.updateSelectedAreaPreview();
    }

    getDrawingAction(): DrawingAction {
        const options = {
            primaryColor: this.primaryColor,
            toolOptions: new Map<Options, ToolOption>(),
        };

        return {
            id: DrawingToolId.ellipseSelectionService,
            imageData: this.selectedImageData,
            box: this.selectedBox.copy(),
            options,
        };
    }

    private imagedata_to_image(imagedata: ImageData): CanvasImageSource {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        canvas.width = imagedata.width;
        canvas.height = imagedata.height;
        ctx.putImageData(imagedata, 0, 0);
        const image = new Image();
        image.src = canvas.toDataURL();
        return image;
    }
}
