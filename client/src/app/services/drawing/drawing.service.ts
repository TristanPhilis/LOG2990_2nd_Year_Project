import { Injectable } from '@angular/core';
import { BoundingBox } from '@app/classes/bounding-box';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    baseCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;

    getImageData(): ImageData {
        return this.baseCtx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }

    getImageURL(): string {
        return this.canvas.toDataURL();
    }

    setImageData(imageData: ImageData): void {
        this.baseCtx.putImageData(imageData, 0, 0);
    }

    fillCanvas(color: string, region?: BoundingBox): void {
        this.baseCtx.fillStyle = color;
        if (region) {
            this.baseCtx.fillRect(region.position.x, region.position.y, region.width, region.heigth);
        } else {
            this.baseCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    clearCanvas(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}
