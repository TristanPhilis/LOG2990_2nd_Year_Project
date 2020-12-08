import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Box } from '@app/classes/box';
import { Vec2 } from '@app/classes/vec2';
import { DASHLINE_EMPTY, DASHLINE_FULL, SELECTION_CONTOUR_COLOUR } from '@app/shared/constant';

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

    applyRotation(ctx: CanvasRenderingContext2D, angle: number, center: Vec2): void {
        ctx.translate(center.x, center.y);
        ctx.rotate(angle);
        ctx.translate(-center.x, -center.y);
    }

    applyMirrorScaling(ctx: CanvasRenderingContext2D, box: Box): void {
        const xMirrorScale = Math.sign(box.width);
        const yMirrorScale = Math.sign(box.height);
        const xTranslationAdjustment = xMirrorScale < 0 ? 2 * box.position.x + box.width : 0;
        const yTranslationAdjustment = yMirrorScale < 0 ? 2 * box.position.y + box.height : 0;
        ctx.translate(xTranslationAdjustment, yTranslationAdjustment);
        ctx.scale(xMirrorScale, yMirrorScale);
    }

    drawSelectionContour(ctx: CanvasRenderingContext2D, contour: Path2D): void {
        ctx.strokeStyle = 'white';
        ctx.stroke(contour);
        ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);
        ctx.strokeStyle = SELECTION_CONTOUR_COLOUR;
        ctx.stroke(contour);
        ctx.setLineDash([]);
    }
}
