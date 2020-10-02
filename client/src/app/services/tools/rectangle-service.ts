import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SHIFT_KEY } from '@app/shared/constant';
import { MouseButton } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class RectangleService extends Tool {
    initialCoord: Vec2;
    private thickness: number;

    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.thickness = 0;
    }

    set _thickness(newThickness: number) {
        this.thickness = newThickness;
    }

    get _thickness(): number {
        return this.thickness;
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
        if (this.mouseDown) {
            this.drawRectangle(this.drawingService.baseCtx);
        }
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && event.buttons === MouseButton.Left) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.drawRectangle(this.drawingService.previewCtx);
        }
        if (this.mouseDown && !(event.buttons === MouseButton.Left)) {
            this.drawRectangle(this.drawingService.baseCtx);
            this.mouseDown = false;
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === SHIFT_KEY) {
            this.shiftDown = false;
            if (this.mouseDown) {
                this.drawRectangle(this.drawingService.previewCtx);
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === SHIFT_KEY) {
            this.shiftDown = true;
            if (this.mouseDown) {
                this.drawRectangle(this.drawingService.previewCtx);
            }
        }
    }

    private drawRectangle(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        ctx.beginPath();
        // tslint:disable-next-line: prefer-const
        let traceType = 0;

        const width = this.mouseDownCoord.x - this.initialCoord.x;
        const height = this.mouseDownCoord.y - this.initialCoord.y;

        ctx.lineWidth = this.thickness;

        if (this.shiftDown) {
            const squareSize = Math.min(Math.abs(width), Math.abs(height));
            ctx.rect(this.initialCoord.x, this.initialCoord.y, squareSize * Math.sign(width), squareSize * Math.sign(height));
        } else {
            ctx.rect(this.initialCoord.x, this.initialCoord.y, width, height);
        }

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
