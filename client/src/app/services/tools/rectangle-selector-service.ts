import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MouseButton } from '@app/shared/enum';

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

    constructor(drawingService: DrawingService) {
        super(drawingService);
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
        if (this.mouseDown && !this.isAreaSelected) {
            this.selectArea(this.drawingService.baseCtx);
            this.isAreaSelected = true;
            this.mouseDown = false;
        }
        if (this.mouseDown && this.isAreaSelected) {
            this.moveSelection(this.drawingService.baseCtx);
            this.isAreaSelected = false;
        }
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && event.buttons === MouseButton.Left && !this.isAreaSelected) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.rectangleSelection(this.drawingService.previewCtx);
        }
        if (this.mouseDown && !(event.buttons === MouseButton.Left) && !this.isAreaSelected) {
            this.selectArea(this.drawingService.baseCtx);
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

    private selectArea(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        const width = this.mouseDownCoord.x - this.initialCoord.x;
        const height = this.mouseDownCoord.y - this.initialCoord.y;

        this.selectedArea = ctx.getImageData(this.initialCoord.x, this.initialCoord.y, width, height);

        this.savedHeight = height;
        this.savedWidth = width;
        this.savedInitialCoords = this.initialCoord;
    }

    private moveSelection(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        ctx.beginPath();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.rect(this.savedInitialCoords.x, this.savedInitialCoords.y, this.savedWidth, this.savedHeight);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.putImageData(this.selectedArea, this.mouseDownCoord.x, this.mouseDownCoord.y);
    }
}
