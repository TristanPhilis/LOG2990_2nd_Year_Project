import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MouseButton } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class RectangleService extends Tool {
    initialPosition: Vec2;
    width: number;
    height: number;

    constructor(drawingService: DrawingService) {
        super(drawingService);
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            this.initialPosition = this.getPositionFromMouse(event);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.drawRectangle(this.drawingService.baseCtx, event);
        }
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawRectangle(this.drawingService.previewCtx, event);
        }
    }

    private drawRectangle(ctx: CanvasRenderingContext2D, event: MouseEvent): void {
        ctx.beginPath();
        const currentMouseCoord = this.getPositionFromMouse(event);

        // tslint:disable-next-line: prefer-const
        let traceType = 0;
        const x1 = this.initialPosition.x;
        const y1 = this.initialPosition.y;
        let x2 = currentMouseCoord.x;
        let y2 = currentMouseCoord.y;

        if (event.shiftKey) {
            const diffX = x2 - x1;
            const diffY = y2 - y1;

            if (Math.abs(diffX) < Math.abs(diffY)) y2 = y1 + Math.abs(diffX) * Math.sign(diffY);
            else x2 = x1 + Math.abs(diffY) * Math.sign(diffX);
        }

        ctx.lineTo(x1, y1);
        ctx.lineTo(x1, y2);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x2, y1);
        ctx.lineTo(x1, y1);

        switch (traceType) {
            case 0:
                ctx.fill();

                break;
            case 1:
                ctx.stroke();

                break;
            case 2:
                ctx.fill();
                ctx.stroke();
                break;
            default:
                ctx.fill();
        }
    }
}
