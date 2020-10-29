import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SHIFT_KEY } from '@app/shared/constant';
import { MouseButton } from '@app/shared/enum';
import { UndoRedoService } from './undoRedo-service';

@Injectable({
    providedIn: 'root',
})
export class EllipseService extends Tool {
    initialCoord: Vec2;

    private thickness: number;
    private pathData: Vec2[];

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
            const currentPosition = this.getPositionFromMouse(event);
            this.initialCoord = currentPosition;
            this.mouseDownCoord = currentPosition;
            this.pathData.push(this.initialCoord);
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && event.buttons === MouseButton.Left) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.drawEllipse(this.drawingService.previewCtx);
        }
        if (this.mouseDown && !(event.buttons === MouseButton.Left)) {
            this.mouseDown = false;
            this.drawEllipse(this.drawingService.baseCtx);
        }
    }

    onMouseUp(event: MouseEvent, undoRedo: UndoRedoService): void {
        if (this.mouseDown) {
            this.pathData.push(this.mouseDownCoord);
            undoRedo.undoPile.push({ path: this.pathData, id: 'ellipse', thickness: this._thickness });
            this.drawEllipse(this.drawingService.baseCtx);
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === SHIFT_KEY) {
            this.shiftDown = false;
            if (this.mouseDown) {
                this.drawEllipse(this.drawingService.previewCtx);
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === SHIFT_KEY) {
            this.shiftDown = true;
            if (this.mouseDown) {
                this.drawEllipse(this.drawingService.previewCtx);
            }
        }
    }

    drawEllipse(ctx: CanvasRenderingContext2D): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        ctx.beginPath();
        const xRadius = (this.mouseDownCoord.x - this.initialCoord.x) / 2;
        const yRadius = (this.mouseDownCoord.y - this.initialCoord.y) / 2;
        ctx.lineWidth = this.thickness;

        if (this.shiftDown) {
            const smallestRadius = Math.min(Math.abs(xRadius), Math.abs(yRadius));
            const xMiddle = this.initialCoord.x + smallestRadius * Math.sign(xRadius);
            const yMiddle = this.initialCoord.y + smallestRadius * Math.sign(yRadius);
            ctx.arc(xMiddle, yMiddle, smallestRadius, 0, 2 * Math.PI);
        } else {
            const xMiddle = this.initialCoord.x + xRadius;
            const yMiddle = this.initialCoord.y + yRadius;
            ctx.ellipse(xMiddle, yMiddle, Math.abs(xRadius), Math.abs(yRadius), 0, 0, 2 * Math.PI);
        }

        ctx.stroke(); // Stroke for now, has to be dynamic to fill for example
    }
    private clearPath(): void {
        this.pathData = [];
    }
}
