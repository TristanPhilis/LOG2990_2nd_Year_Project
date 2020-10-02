import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MouseButton, Texture } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class BrushService extends Tool {
    private pathData: Vec2[];
    // Todo: Attributs globaux
    // private color: string;
    // private opacity: number;
    private thickness: number;
    selectedTexture: Texture;

    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.thickness = 1; // Remplacer par un observable
        this.clearPath();
        this.selectedTexture = Texture.one;
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

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.drawBrush(this.drawingService.baseCtx, this.pathData);
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && event.buttons === MouseButton.Left) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            // On dessine sur le canvas de prévisualisation et on l'efface à chaque déplacement de la souris
            this.drawBrush(this.drawingService.previewCtx, this.pathData);
        }
        if (this.mouseDown && !(event.buttons === MouseButton.Left)) {
            this.drawBrush(this.drawingService.baseCtx, this.pathData);
        }
    }

    private drawBrush(ctx: CanvasRenderingContext2D, path: Vec2[]): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineWidth = this.thickness;
        const image = new Image(1, 1);
        image.src = this.selectedTexture;
        const pattern = ctx.createPattern(image, 'repeat');
        if (pattern !== null) ctx.strokeStyle = pattern;
        for (const point of path) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
