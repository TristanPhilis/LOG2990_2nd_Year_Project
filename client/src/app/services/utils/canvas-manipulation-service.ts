import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class CanvasManipulationService {
    private renderer: Renderer2;

    constructor(private rendererFactory: RendererFactory2) {
        this.renderer = this.rendererFactory.createRenderer(null, null);
    }

    getImageFromImageData(imageData: ImageData): CanvasImageSource {
        const imageCanvas = this.renderer.createElement('canvas');
        imageCanvas.width = imageData.width;
        imageCanvas.height = imageData.height;
        const imageCtx = imageCanvas.getContext('2d') as CanvasRenderingContext2D;
        imageCtx.putImageData(imageData, 0, 0);
        return imageCanvas;
    }

    createCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas = this.renderer.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }
}
