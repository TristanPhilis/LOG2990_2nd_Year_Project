import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DASHLINE_EMPTY, DASHLINE_FULL, DEPLACEMENT, ESCAPE_KEY, SHIFT_KEY } from '@app/shared/constant';
import { MouseButton } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class EllipseSelectorService extends Tool {
    initialCoord: Vec2;
    isAreaSelected: boolean = false;
    wasItCircle: boolean = false;
    selectedArea: ImageData;
    savedInitialCoords: Vec2;
    imageLocation: Vec2 = { x: 0, y: 0 };
    shiftDown: boolean;
    savedYMiddle: number;
    savedXMiddle: number;
    savedCircleRadius: number;
    savedXRadius: number;
    savedYRadius: number;

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
                console.log('copied');
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

        ctx.strokeStyle = '#111155';
        this.savedXRadius = (this.mouseDownCoord.x - this.initialCoord.x) / 2;
        this.savedYRadius = (this.mouseDownCoord.y - this.initialCoord.y) / 2;

        if (this.shiftDown) {
            this.savedCircleRadius = Math.min(Math.abs(this.savedXRadius), Math.abs(this.savedYRadius));
            this.savedXMiddle = this.initialCoord.x + this.savedCircleRadius * Math.sign(this.savedXRadius);
            this.savedYMiddle = this.initialCoord.y + this.savedCircleRadius * Math.sign(this.savedYRadius);
            this.wasItCircle = true;
            ctx.arc(this.savedXMiddle, this.savedYMiddle, this.savedCircleRadius, 0, 2 * Math.PI);
        } else {
            this.savedXMiddle = this.initialCoord.x + this.savedXRadius;
            this.savedYMiddle = this.initialCoord.y + this.savedYRadius;
            this.wasItCircle = true;
            ctx.ellipse(this.savedXMiddle, this.savedYMiddle, Math.abs(this.savedXRadius), Math.abs(this.savedYRadius), 0, 0, 2 * Math.PI);
        }
        this.imageLocation.x = this.savedXMiddle - Math.abs(this.savedXRadius);
        this.imageLocation.y = this.savedYMiddle - Math.abs(this.savedYRadius);
        console.log(this.imageLocation.x);
        ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    private copyArea(ctx: CanvasRenderingContext2D): void {
        this.selectedArea = ctx.getImageData(
            this.initialCoord.x,
            this.initialCoord.y,
            Math.abs(this.savedXRadius * 2),
            Math.abs(this.savedYRadius * 2),
        );
    }

    private moveSelectionWithMouse(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        this.imageLocation.x = this.mouseDownCoord.x - Math.abs(this.savedXRadius);
        this.imageLocation.y = this.mouseDownCoord.y - Math.abs(this.savedYRadius);

        ctx.beginPath();
        if (this.wasItCircle) {
            ctx.arc(this.mouseDownCoord.x, this.mouseDownCoord.y, this.savedCircleRadius, 0, 2 * Math.PI);
        } else {
            ctx.ellipse(this.mouseDownCoord.x, this.mouseDownCoord.y, Math.abs(this.savedXRadius), Math.abs(this.savedYRadius), 0, 0, 2 * Math.PI);
        }
        ctx.globalCompositeOperation = 'source-in';

        ctx.putImageData(this.selectedArea, this.imageLocation.x, this.imageLocation.y);

        this.drawingService.baseCtx.globalCompositeOperation = 'source-over';
        ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    private moveSelectionWithArrows(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        ctx.beginPath();
        ctx.strokeStyle = '#111155';
        if (this.wasItCircle) {
            ctx.arc(this.savedXMiddle, this.savedYMiddle, this.savedCircleRadius, 0, 2 * Math.PI);
        } else {
            ctx.ellipse(this.savedXMiddle, this.savedYMiddle, Math.abs(this.savedXRadius), Math.abs(this.savedYRadius), 0, 0, 2 * Math.PI);
        }
        ctx.globalCompositeOperation = 'source-in';
        ctx.putImageData(this.selectedArea, this.imageLocation.x, this.imageLocation.y);
        this.drawingService.baseCtx.globalCompositeOperation = 'source-over';
        ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    private clearSelectedArea(): void {
        this.drawingService.baseCtx.beginPath();
        if (this.wasItCircle) {
            this.drawingService.baseCtx.arc(this.savedXMiddle, this.savedYMiddle, this.savedCircleRadius, 0, 2 * Math.PI);
        } else {
            this.drawingService.baseCtx.ellipse(
                this.savedXMiddle,
                this.savedYMiddle,
                Math.abs(this.savedXRadius),
                Math.abs(this.savedYRadius),
                0,
                0,
                2 * Math.PI,
            );
        }
        this.drawingService.baseCtx.fill();
    }

    placeImage(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.isAreaSelected) {
            this.drawingService.baseCtx.beginPath();
            if (this.wasItCircle) {
                this.drawingService.baseCtx.arc(this.savedXMiddle, this.savedYMiddle, this.savedCircleRadius, 0, 2 * Math.PI);
            } else {
                this.drawingService.baseCtx.ellipse(
                    this.savedXMiddle,
                    this.savedYMiddle,
                    Math.abs(this.savedXRadius),
                    Math.abs(this.savedYRadius),
                    0,
                    0,
                    2 * Math.PI,
                );
            }
            this.drawingService.baseCtx.globalCompositeOperation = 'source-in';
            this.drawingService.baseCtx.putImageData(this.selectedArea, this.imageLocation.x, this.imageLocation.y);
            this.drawingService.baseCtx.globalCompositeOperation = 'source-over';
            console.log('hello');
        }
        this.isAreaSelected = false;
        this.drawingService.baseCtx.globalCompositeOperation = 'source-over';
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
