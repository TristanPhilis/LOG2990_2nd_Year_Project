import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
}

@Injectable({
    providedIn: 'root',
})
export class RectangleService extends Tool {
    private pathData: Vec2[];
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.clearPath();
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.clearPath();

            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.drawRectangle(this.drawingService.baseCtx, this.pathData, event);
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);

            // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawRectangle(this.drawingService.previewCtx, this.pathData, event);
        }
    }

    private drawRectangle(ctx: CanvasRenderingContext2D, path: Vec2[], event: MouseEvent): void {
        ctx.beginPath();
        const currentMouseCoord = this.getPositionFromMouse(event);

        // tslint:disable-next-line: prefer-const
        let traceType = 0;
        const x1 = path[0].x;
        const y1 = path[0].y;
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

    private clearPath(): void {
        this.pathData = [];
    }
}
