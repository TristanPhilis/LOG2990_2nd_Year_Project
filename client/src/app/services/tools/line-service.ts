import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class LineService extends Tool {
    private pathData: Vec2[];
    private angle: number;
    private currentPoint: Vec2;

    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.clearPath();
    }

    onMouseDown(event: MouseEvent): void {
        if (this.mouseDown) {
            this.drawingService.previewCtx.beginPath();
            this.currentPoint = { x: event.offsetX, y: event.offsetY };
            this.drawingService.previewCtx.stroke();
            this.drawLine(this.drawingService.baseCtx, event);
            this.pathData.push(this.mouseDownCoord);
            console.log(this.pathData, 'DOWN');
        }
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
        this.mouseDown = true;
    }

    calculateAngle(): number {
        const size = this.pathData.length;
        if (size) {
            const xRadius = Math.abs(this.mouseDownCoord.x - this.pathData[0].x);
            const yRadius = Math.abs(this.mouseDownCoord.y - this.pathData[0].y);

            this.angle = Math.atan(yRadius / xRadius);
        }
        return this.angle;
    }

    private drawLine(ctx: CanvasRenderingContext2D, event: MouseEvent): void {
        ctx.beginPath();
        const angle = this.calculateAngle();
        const point = this.pathData.pop();

        if (event.shiftKey) {
            if (angle < Math.PI / 8) {
                const x1 = this.pathData[0].x;
                const x2 = this.mouseDownCoord.x;
                const y1 = this.pathData[0].y;

                ctx.lineTo(x1, y1);
                ctx.lineTo(x2, y1);
            } else if (angle > (3 * Math.PI) / 8) {
                const x1 = this.pathData[0].x;
                const y1 = this.pathData[0].y;
                const y2 = this.mouseDownCoord.y;

                ctx.lineTo(x1, y1);
                ctx.lineTo(x1, y2);
            } else {
                const x1 = this.pathData[0].x;
                const x2 = this.mouseDownCoord.x;
                const y1 = this.pathData[0].y;
                const deltaX = this.pathData[0].x - this.mouseDownCoord.x;
                const deltaY = this.pathData[0].y - this.mouseDownCoord.y;

                if ((deltaX > 0 && deltaY < 0) || (deltaX < 0 && deltaY > 0)) {
                    const y2 = Math.round(deltaX + this.mouseDownCoord.y);
                    ctx.lineTo(x1, y1);
                    ctx.lineTo(x2, y2);
                } else {
                    const y2 = Math.round(-deltaX + this.mouseDownCoord.y);
                    ctx.lineTo(x1, y1);
                    ctx.lineTo(x2, y2);
                }
            }
        } else {
            ctx.lineTo(event.offsetX, event.offsetY);
            if (point && this.currentPoint) {
                ctx.lineTo(this.currentPoint.x, this.currentPoint.y);
                ctx.lineTo(point.x, point.y);
            }
        }
        ctx.stroke();
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
