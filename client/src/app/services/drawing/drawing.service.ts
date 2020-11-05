import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    baseCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    drawingToLoad: string;
    mouseIsOverCanvas: boolean = false;

    getImageData(): ImageData {
        return this.baseCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    getImageURL(): string {
        return this.canvas.toDataURL();
    }

    setImageData(imageData: ImageData): void {
        this.baseCtx.putImageData(imageData, 0, 0);
    }

    fillCanvas(color: string): void {
        this.baseCtx.fillStyle = color;
        this.baseCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    clearCanvas(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    isCoordInCanvas(coord: Vec2): boolean {
        const xIsValid = coord.x >= 0 && coord.x <= this.canvas.width;
        const yIsValid = coord.y >= 0 && coord.y <= this.canvas.height;
        return xIsValid && yIsValid;
    }

    loadDrawing(context: CanvasRenderingContext2D): void {
        const image = new Image();
        image.src = this.drawingToLoad;
        context.drawImage(image, 0, 0);
    }

    sendDrawing(drawing: string): void {
        this.drawingToLoad = drawing;
    }
}
