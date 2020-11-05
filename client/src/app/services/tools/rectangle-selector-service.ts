import { Injectable } from '@angular/core';
import { DrawingAction } from '@app/classes/drawing-action';
import { Tool } from '@app/classes/tool';
import { ToolOption } from '@app/classes/tool-option';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { drawingToolId, MouseButton, Options } from '@app/shared/enum';
import { UndoRedoService } from './undoredo-service';

@Injectable({
    providedIn: 'root',
})
export class RectangleSelectorService extends Tool {
    initialCoord: Vec2;
    isAreaSelected: boolean = false;
    selectedArea: ImageData;
    savedWidth: number;
    savedHeight: number;
    savedInitialCoords: Vec2;

    constructor(drawingService: DrawingService, undoRedoService: UndoRedoService, colorService: ColorSelectionService) {
        super(drawingService, undoRedoService, colorService);
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            const currentCoord = this.getPositionFromMouse(event);
            this.initialCoord = currentCoord;
            this.mouseDownCoord = currentCoord;
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.isAreaSelected) {
            this.moveSelection(this.drawingService.baseCtx);
        }
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && event.buttons === MouseButton.Left && !this.isAreaSelected) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.rectangleSelection(this.drawingService.previewCtx);
        }
        if (this.mouseDown && !(event.buttons === MouseButton.Left) && !this.isAreaSelected) {
            this.rectangleSelection(this.drawingService.baseCtx);
            this.mouseDown = false;
        }

        if (this.mouseDown && event.buttons === MouseButton.Left && this.isAreaSelected) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.moveSelection(this.drawingService.previewCtx);
        }
        if (this.mouseDown && !(event.buttons === MouseButton.Left) && this.isAreaSelected) {
            this.moveSelection(this.drawingService.baseCtx);
            this.mouseDown = false;
        }
    }

    private rectangleSelection(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        ctx.beginPath();

        const width = this.mouseDownCoord.x - this.initialCoord.x;
        const height = this.mouseDownCoord.y - this.initialCoord.y;

        ctx.strokeStyle = '#111155';
        this.selectedArea = ctx.getImageData(this.initialCoord.x, this.initialCoord.y, width, height);
        // tslint:disable-next-line: no-magic-numbers
        ctx.setLineDash([5, 15]);
        ctx.rect(this.initialCoord.x, this.initialCoord.y, width, height);
        ctx.stroke();
        ctx.setLineDash([]);
        this.selectedArea = ctx.getImageData(this.initialCoord.x, this.initialCoord.y, width, height);
        this.savedHeight = height;
        this.savedWidth = width;
        this.savedInitialCoords = this.initialCoord;
    }

    private moveSelection(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.globalCompositeOperation = 'source-out';
        ctx.rect(this.savedInitialCoords.x, this.savedInitialCoords.y, this.savedWidth, this.savedHeight);
        ctx.fill();

        ctx.globalCompositeOperation = 'source-over';
        ctx.putImageData(this.selectedArea, this.mouseDownCoord.x, this.mouseDownCoord.y);
    }

    getDrawingAction(): DrawingAction {
        const options = {
            primaryColor: this.primaryColor,
            toolOptions: new Map<Options, ToolOption>(),
        };

        return {
            id: drawingToolId.rectangleSelectionService,
            options,
        };
    }
}
