import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SHIFT_KEY } from '@app/shared/constant';
import { MouseButton, TraceTypes } from '@app/shared/enum';
import { UndoRedoService } from './undoRedo-service';

@Injectable({
    providedIn: 'root',
})
export class RectangleService extends Tool {
    initialCoord: Vec2;
    private pathData: Vec2[];
    private thickness: number;
    private traceType: number;

    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.clearPath();
        this.thickness = 0;
        this.traceType = 0;
    }

    set _thickness(newThickness: number) {
        this.thickness = newThickness;
    }

    get _thickness(): number {
        return this.thickness;
    }

    set _traceType(newType: number) {
        this.traceType = newType;
    }

    get _traceType(): number {
        return this.traceType;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            const currentCoord = this.getPositionFromMouse(event);
            this.initialCoord = currentCoord;
            this.mouseDownCoord = currentCoord;
            this.pathData.push(this.mouseDownCoord);
        }
    }

    onMouseUp(event: MouseEvent, undoRedo: UndoRedoService): void {
        if (this.mouseDown) {
            undoRedo.undoPile.push({ path: this.pathData, id: 'rectangle' });
            this.drawRectangle(this.drawingService.baseCtx);
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && event.buttons === MouseButton.Left) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.drawRectangle(this.drawingService.previewCtx);
            this.pathData.push(this.mouseDownCoord);
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

    drawRectangle(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        ctx.beginPath();
        // tslint:disable-next-line: prefer-const

        const width = this.mouseDownCoord.x - this.initialCoord.x;
        const height = this.mouseDownCoord.y - this.initialCoord.y;

        ctx.lineWidth = this.thickness;

        if (this.shiftDown) {
            const squareSize = Math.min(Math.abs(width), Math.abs(height));
            ctx.rect(this.initialCoord.x, this.initialCoord.y, squareSize * Math.sign(width), squareSize * Math.sign(height));
        } else {
            ctx.rect(this.initialCoord.x, this.initialCoord.y, width, height);
        }

        switch (this.traceType) {
            case TraceTypes.fill:
                ctx.fill();
                break;
            case TraceTypes.stroke:
                ctx.stroke();
                break;
            case TraceTypes.fillAndStroke:
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
