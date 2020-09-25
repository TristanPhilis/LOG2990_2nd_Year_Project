import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MouseButton } from '@app/shared/enum';

// TODO : Déplacer ça dans un fichier séparé accessible par tous

@Injectable({
    providedIn: 'root',
})
export class EraserService extends Tool {
    initial: Vec2;
    mouseCoord: Vec2;

    constructor(drawingService: DrawingService) {
        super(drawingService);
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            this.initial = this.getPositionFromMouse(event);
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && event.buttons === MouseButton.Left) {
            this.mouseCoord = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.eraserLine(this.drawingService.previewCtx, event);
        }
        if (this.mouseDown && !(event.buttons === MouseButton.Left)) {
            this.mouseDown = false;
            this.eraserLine(this.drawingService.baseCtx, event);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.eraserLine(this.drawingService.baseCtx, event);
        }
        this.mouseDown = false;
    }

    private eraserLine(ctx: CanvasRenderingContext2D, event: MouseEvent): void {
        ctx.beginPath();

        const smallestRadius = 5;

        ctx.arc(this.mouseCoord.x, this.mouseCoord.y, smallestRadius, 0, 2 * Math.PI);

        ctx.stroke(); // Stroke for now, has to be dynamic to fill for example
    }
}
