import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DASHLINE_EMPTY, DASHLINE_FULL, DEPLACEMENT, ESCAPE_KEY, SHIFT_KEY } from '@app/shared/constant';
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
    imageLocation: Vec2 = { x: 0, y: 0 };
    shiftDown: boolean;

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
                this.clearSelectedArea();
            } else {
                this.savedInitialCoords = currentCoord;
            }
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            if (!this.isAreaSelected) {
                this.selectArea(this.drawingService.previewCtx);
                this.copyArea(this.drawingService.baseCtx);
            }
            this.isAreaSelected = true;
            this.mouseDown = false;
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && event.buttons === MouseButton.Left && !this.isAreaSelected) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.selectArea(this.drawingService.previewCtx);
        }

        if (this.mouseDown && !(event.buttons === MouseButton.Left) && !this.isAreaSelected) {
            this.selectArea(this.drawingService.previewCtx);
            this.mouseDown = false;
            this.isAreaSelected = true;
        }

        if (this.mouseDown && event.buttons === MouseButton.Left && this.isAreaSelected) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.moveSelectionWithMouse(this.drawingService.previewCtx);
        }

        if (this.mouseDown && !(event.buttons === MouseButton.Left) && this.isAreaSelected) {
            this.placeImage();
        }
    }

    private selectArea(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        ctx.beginPath();

        const width = this.mouseDownCoord.x - this.initialCoord.x;
        const height = this.mouseDownCoord.y - this.initialCoord.y;

        ctx.strokeStyle = '#111155';

        ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);
        if (this.shiftDown) {
            const squareSize = Math.min(Math.abs(width), Math.abs(height));
            this.savedHeight = squareSize * Math.sign(height);
            this.savedWidth = squareSize * Math.sign(width);
            ctx.rect(this.initialCoord.x, this.initialCoord.y, squareSize * Math.sign(width), squareSize * Math.sign(height));
        } else {
            this.savedHeight = height;
            this.savedWidth = width;
            ctx.rect(this.initialCoord.x, this.initialCoord.y, width, height);
        }

        ctx.stroke();
        ctx.setLineDash([]);

        if (this.savedWidth > 0) {
            this.imageLocation.x = this.initialCoord.x;
        } else {
            this.imageLocation.x = this.mouseDownCoord.x;
        }
        if (this.savedHeight > 0){
            this.imageLocation.y = this.initialCoord.y;
        } else {
            this.imageLocation.y = this.mouseDownCoord.y;
        }
    }

    private copyArea(ctx: CanvasRenderingContext2D): void {
        this.selectedArea = ctx.getImageData(this.imageLocation.x, this.imageLocation.y, Math.abs(this.savedWidth), Math.abs(this.savedHeight));
    }

    private moveSelectionWithMouse(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        let differenceX: number;
        let differenceY: number;
        const imageMiddleX = this.imageLocation.x + this.savedWidth / 2;
        const imageMiddleY = this.imageLocation.y + this.savedHeight / 2;

        differenceX = this.mouseDownCoord.x - imageMiddleX;
        differenceY = this.mouseDownCoord.y - imageMiddleY;

        this.imageLocation.x += differenceX;
        this.imageLocation.y += differenceY;

        ctx.putImageData(this.selectedArea, this.imageLocation.x, this.imageLocation.y);

        ctx.beginPath();
        ctx.strokeStyle = '#111155';

        ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);

        ctx.rect(this.imageLocation.x, this.imageLocation.y, this.savedWidth, this.savedHeight);

        ctx.stroke();
        ctx.setLineDash([]);
    }

    private moveSelectionWithArrows(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        ctx.putImageData(this.selectedArea, this.imageLocation.x, this.imageLocation.y);

        ctx.beginPath();
        ctx.strokeStyle = '#111155';

        ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);

        ctx.rect(this.imageLocation.x, this.imageLocation.y, this.savedWidth, this.savedHeight);

        ctx.stroke();
        ctx.setLineDash([]);
    }

    private clearSelectedArea(): void {
        this.drawingService.baseCtx.rect(this.savedInitialCoords.x, this.savedInitialCoords.y, this.savedWidth, this.savedHeight);
        this.drawingService.baseCtx.globalCompositeOperation = 'destination-out';
        this.drawingService.baseCtx.fill();
        this.drawingService.baseCtx.globalCompositeOperation = 'source-over';
    }

    placeImage(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.isAreaSelected) {
            this.drawingService.baseCtx.putImageData(this.selectedArea, this.imageLocation.x, this.imageLocation.y);
        }
        this.isAreaSelected = false;
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === ESCAPE_KEY) {
            this.placeImage();
        }
        if (event.key === SHIFT_KEY) {
            this.shiftDown = false;
            if (this.mouseDown) {
                this.selectArea(this.drawingService.previewCtx);
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === SHIFT_KEY) {
            this.shiftDown = true;
            if (this.mouseDown) {
                this.selectArea(this.drawingService.previewCtx);
            }
        } else if (this.isAreaSelected) {
            if (event.key === 'ArrowDown') {
                this.imageLocation.y += DEPLACEMENT;
                this.moveSelectionWithArrows(this.drawingService.previewCtx);
            }
            if (event.key === 'ArrowUp') {
                this.imageLocation.y -= DEPLACEMENT;
                this.moveSelectionWithArrows(this.drawingService.previewCtx);
            }
            if (event.key === 'ArrowLeft') {
                this.imageLocation.x -= DEPLACEMENT;
                this.moveSelectionWithArrows(this.drawingService.previewCtx);
            }
            if (event.key === 'ArrowRight') {
                this.imageLocation.x += DEPLACEMENT;
                this.moveSelectionWithArrows(this.drawingService.previewCtx);
            }
        }
    }
}
