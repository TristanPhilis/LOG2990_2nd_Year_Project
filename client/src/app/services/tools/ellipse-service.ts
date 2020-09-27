import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MouseButton } from '@app/shared/enum';

// TODO : Déplacer ça dans un fichier séparé accessible par tous

@Injectable({
    providedIn: 'root',
})
export class EllipseService extends Tool {
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
            this.drawEllipse(this.drawingService.previewCtx, event);
        }
        if (this.mouseDown && !(event.buttons === MouseButton.Left)) {
            this.mouseDown = false;
            this.drawEllipse(this.drawingService.baseCtx, event);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.drawEllipse(this.drawingService.baseCtx, event);
        }
        this.mouseDown = false;
    }

    private drawEllipse(ctx: CanvasRenderingContext2D, event: MouseEvent): void {
        ctx.beginPath();
        const xRadius = Math.abs(this.initial.x - this.mouseCoord.x) / 2;
        const yRadius = Math.abs(this.initial.y - this.mouseCoord.y) / 2;

        const xMiddle = (this.initial.x + this.mouseCoord.x) / 2;
        const yMiddle = (this.initial.y + this.mouseCoord.y) / 2;

        const smallestRadius = Math.min(xRadius, yRadius);

        if (event.shiftKey) {
            ctx.arc(xMiddle, yMiddle, smallestRadius, 0, 2 * Math.PI);
        } else {
            ctx.ellipse(xMiddle, yMiddle, xRadius, yRadius, 0, 0, 2 * Math.PI);
        }

        ctx.stroke(); // Stroke for now, has to be dynamic to fill for example
    }
}
