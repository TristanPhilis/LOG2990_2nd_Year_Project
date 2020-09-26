import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';

export enum MouseButton {
    None = 0,
    Left = 1,
    Middle = 2,
    Right = 3,
    Back = 4,
    Forward = 5,
    click = 6,
}

@Injectable({
    providedIn: 'root',
})
export class LineService extends Tool {
    private pathData: Vec2[];

    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.clearPath();
    }

    onMouseDown(event: MouseEvent): void {
        if (this.mouseDown) {
            this.drawLine(this.drawingService.baseCtx, event);
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
        }
        this.mouseDown = true;
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
            this.drawLine(this.drawingService.baseCtx, event);
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.previewCtx, event);
        }
    }

    private drawLine(ctx: CanvasRenderingContext2D, event: MouseEvent): void {
        ctx.beginPath();
        ctx.lineTo(event.offsetX, event.offsetY);

        const x1 = this.pathData[0].x;
        const y1 = this.pathData[0].y;
        const x2 = this.pathData[1].x;
        const y2 = this.pathData[1].y;

        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.stroke();
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
