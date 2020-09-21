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

    constructor(drawingService: DrawingService) {
        super(drawingService);
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.initial = this.getPositionFromMouse(event);
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.drawEllipse(this.drawingService.previewCtx, event);
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
        const mouseCoord = this.getPositionFromMouse(event);
        const xRadius = Math.abs(this.initial.x - mouseCoord.x);
        const yRadius = Math.abs(this.initial.y - mouseCoord.y);

        if (event.shiftKey) {
            ctx.arc(this.initial.x, this.initial.y, xRadius, 0, 2 * Math.PI);
        } else {
            ctx.ellipse(this.initial.x, this.initial.y, xRadius, yRadius, 0, 0, 2 * Math.PI);
        }

        ctx.stroke(); // Stroke for now, has to be dynamic to fill for example
    }
}
