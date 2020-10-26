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
            if (this.isAreaSelected) {
                this.clearSelectedArea(this.drawingService.baseCtx);
            }
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown && !this.isAreaSelected) {
            this.selectArea(this.drawingService.baseCtx);
            this.isAreaSelected = true;
            this.mouseDown = false;
        }
        if (this.mouseDown && this.isAreaSelected) {
            this.clearSelectedArea(this.drawingService.baseCtx);
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
    }

    private moveSelection(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        ctx.globalCompositeOperation = 'source-over';
        let movingCoordX: number;
        let movingCoordY: number;
        const differenceX = this.mouseDownCoord.x - (this.savedInitialCoords.x + this.savedWidth / 2);
        const differenceY = this.mouseDownCoord.y - (this.savedInitialCoords.y + this.savedHeight / 2);

        movingCoordX = this.savedInitialCoords.x + differenceX;
        movingCoordY = this.savedInitialCoords.y + differenceY;

        ctx.putImageData(this.selectedArea, movingCoordX, movingCoordY);
    }

    private clearSelectedArea(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.rect(this.savedInitialCoords.x, this.savedInitialCoords.y, this.savedWidth, this.savedHeight);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
    }
}
