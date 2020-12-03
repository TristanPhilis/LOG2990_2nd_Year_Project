import { Injectable } from '@angular/core';
import { Box } from '@app/classes/box';
import { Vec2 } from '@app/classes/vec2';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    canvas: HTMLCanvasElement;
    baseCtx: CanvasRenderingContext2D;

    previewCanvas: HTMLCanvasElement;
    previewCtx: CanvasRenderingContext2D;

    gridCanvas: HTMLCanvasElement;
    gridCtx: CanvasRenderingContext2D;

    selectionCanvas: HTMLCanvasElement;
    selectionCtx: CanvasRenderingContext2D;

    drawingToLoad: string;
    mouseIsOverCanvas: boolean = false;

    lastDrawingKey: string;

    onLoadingImage: Subject<Vec2>;

    constructor() {
        localStorage.setItem(this.lastDrawingKey, '');
        this.onLoadingImage = new Subject<Vec2>();
    }

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

    fillCanvasAtLocation(color: string, box: Box): void {
        this.baseCtx.fillStyle = color;
        this.baseCtx.fillRect(box.position.x, box.position.y, box.width, box.height);
    }

    clearCanvas(context: CanvasRenderingContext2D): void {
        const canvas = context === this.selectionCtx ? this.selectionCanvas : this.canvas;
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    isCoordInCanvas(coord: Vec2): boolean {
        const xIsValid = coord.x >= 0 && coord.x <= this.canvas.width;
        const yIsValid = coord.y >= 0 && coord.y <= this.canvas.height;
        return xIsValid && yIsValid;
    }

    loadDrawing(context: CanvasRenderingContext2D): void {
        const image = new Image();
        image.src = this.drawingToLoad;
        if (image.complete) {
            this.onLoadingImage.next({ x: image.width, y: image.height });
            context.drawImage(image, 0, 0);
        } else {
            image.onload = () => {
                this.onLoadingImage.next({ x: image.width, y: image.height });
                context.drawImage(image, 0, 0);
            };
        }
    }

    sendDrawing(drawing: string): void {
        this.drawingToLoad = drawing;
    }

    autoSave(): void {
        localStorage.setItem(this.lastDrawingKey, this.getImageURL());
    }
}
