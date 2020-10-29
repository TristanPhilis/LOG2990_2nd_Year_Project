import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MouseButton } from '@app/shared/enum';
import { UndoRedoService } from './undoRedo-service';

@Injectable({
    providedIn: 'root',
})
export class EraserService extends Tool {
    private pathData: Vec2[];
    private thickness: number;
    private five: number = 5;

    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.thickness = this.five; // Replace by an oberversable
        this.clearPath();
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
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
        }
    }

    onMouseUp(event: MouseEvent, undoRedo: UndoRedoService): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.eraseLine(this.drawingService.baseCtx, this.pathData);
            undoRedo.undoPile.push({ path: this.pathData, id: 'erase' });
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && event.buttons === MouseButton.Left) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.eraseLine(this.drawingService.previewCtx, this.pathData);
            this.eraseLine(this.drawingService.baseCtx, this.pathData);
        }
        if (this.mouseDown && !(event.buttons === MouseButton.Left)) {
            this.eraseLine(this.drawingService.baseCtx, this.pathData);
        }
    }

    eraseLine(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineWidth = this.thickness;
        for (const point of path) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
