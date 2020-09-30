import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import * as CONSTANTS from '@app/shared/constant';
import { MouseButton } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class LineService extends Tool {
    private pathData: Vec2[];
    private angle: number;

    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.clearPath();
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.drawLine(this.drawingService.baseCtx, event, this.pathData);
            this.pathData.push(this.mouseDownCoord);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
        }
        this.mouseDown = false;
        this.dblClick = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (!this.mouseDown && !this.dblClick) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawLine(this.drawingService.previewCtx, event, this.pathData);
        }
    }

    onDblClick(event: MouseEvent): void {
        this.dblClick = true;
        this.clearPath();
    }

    calculateAngle(event: MouseEvent): number {
        const size = this.pathData.length;
        const mousePosition = this.getPositionFromMouse(event);
        if (size) {
            const xRadius = Math.abs(this.pathData[size - 1].x - mousePosition.x);
            const yRadius = Math.abs(this.pathData[size - 1].y - mousePosition.y);

            this.angle = Math.atan(yRadius / xRadius);
        }
        return this.angle;
    }

    private drawLine(ctx: CanvasRenderingContext2D, event: MouseEvent, path: Vec2[]): void {
        const point = this.pathData.pop();
        const angle = this.calculateAngle(event);
        ctx.beginPath();

        if (point && this.mouseDownCoord) {
            if (event.shiftKey) {
                if (angle < Math.PI / CONSTANTS.lineDivideBy8) {
                    ctx.lineTo(this.mouseDownCoord.x, this.mouseDownCoord.y);
                    ctx.lineTo(point.x, this.mouseDownCoord.y);
                } else if (angle > (CONSTANTS.lineNumber3 * Math.PI) / CONSTANTS.lineDivideBy8) {
                    ctx.lineTo(this.mouseDownCoord.x, this.mouseDownCoord.y);
                    ctx.lineTo(this.mouseDownCoord.x, point.y);
                } else {
                    const xRadius = point.x - this.mouseDownCoord.x;
                    const yRadius = point.y - this.mouseDownCoord.y;

                    if ((xRadius > 0 && yRadius < 0) || (xRadius < 0 && yRadius > 0)) {
                        const y = Math.round(xRadius + this.mouseDownCoord.y);
                        ctx.lineTo(this.mouseDownCoord.x, this.mouseDownCoord.y);
                        ctx.lineTo(this.mouseDownCoord.x, y);
                    } else {
                        const y = Math.round(-xRadius + this.mouseDownCoord.y);
                        ctx.lineTo(this.mouseDownCoord.x, this.mouseDownCoord.y);
                        ctx.lineTo(this.mouseDownCoord.x, y);
                    }
                }
            } else {
                ctx.lineTo(this.mouseDownCoord.x, this.mouseDownCoord.y);
                ctx.lineTo(point.x, point.y);
            }
        }
        ctx.stroke();
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
