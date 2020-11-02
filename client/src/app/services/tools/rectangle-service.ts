import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SHIFT_KEY } from '@app/shared/constant';
import { drawingToolId, MouseButton, TraceTypes } from '@app/shared/enum';
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
    get pathdata(): Vec2[] {
        return this.pathData;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            const currentCoord = this.getPositionFromMouse(event);
            this.initialCoord = currentCoord;
            this.mouseDownCoord = currentCoord;
            this.pathData.push(currentCoord);
        }
    }

    onMouseUp(event: MouseEvent, undoRedo: UndoRedoService): void {
        if (this.mouseDown) {
            this.pathData.push(this.mouseDownCoord);
            undoRedo.undoPile.push({
                path: this.pathData,
                id: drawingToolId.rectangleService,
                thickness: this._thickness,
                traceType: this._traceType,
            });
            this.draw(this.drawingService.baseCtx, this.pathData);
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && event.buttons === MouseButton.Left) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
            this.draw(this.drawingService.previewCtx, this.pathData);
            this.pathData.pop();
        }
        if (this.mouseDown && !(event.buttons === MouseButton.Left)) {
            this.draw(this.drawingService.baseCtx, this.pathData);
            this.mouseDown = false;
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === SHIFT_KEY) {
            this.shiftDown = false;
            if (this.mouseDown) {
                this.draw(this.drawingService.previewCtx, this.pathData);
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === SHIFT_KEY) {
            this.shiftDown = true;
            if (this.mouseDown) {
                this.draw(this.drawingService.previewCtx, this.pathData);
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        ctx.beginPath();
        // tslint:disable-next-line: prefer-const

        const width = path[1].x - path[0].x;
        const height = path[1].y - path[0].y;

        ctx.lineWidth = this.thickness;

        if (this.shiftDown) {
            const squareSize = Math.min(Math.abs(width), Math.abs(height));
            ctx.rect(path[0].x, path[0].y, squareSize * Math.sign(width), squareSize * Math.sign(height));
        } else {
            ctx.rect(path[0].x, path[0].y, width, height);
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
