import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '../drawing/drawing.service';

export enum MouseButton {
    Left = 0,
    Middle = 1,
    Right = 2,
    Back = 3,
    Forward = 4,
    click = 5,
}

@Injectable({
    providedIn: 'root',
})
export class LineService extends Tool {
    private pathData: Vec2[];

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

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);

            // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
            // this.drawingService.clearCanvas(this.drawingService.previewCtx);
            // if (event.click -> draw line); reflexion sur suppression de clearth path ou non pour conserver lien vecs2 pour coordonnes x,y
            this.drawLine(this.drawingService.previewCtx, this.pathData, event);
        }
    }

    private drawLine(ctx: CanvasRenderingContext2D, path: Vec2[], event: MouseEvent): void {
        ctx.beginPath();
        const mouseCoord = this.getPositionFromMouse(event);

        const i = 0;
        const x1 = mouseCoord.x;
        const y1 = mouseCoord.y;
        const x2 = this.pathData[i + 1].x;
        const y2 = this.pathData[i + 1].y;
        ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);

        ctx.stroke();
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
