import { Injectable } from '@angular/core';
import { BoundingBox } from '@app/classes/bounding-box';
import { Color, MAX_ALPHA } from '@app/classes/color';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { A_POSITION, B_POSITION, G_POSITION, PREVIEW_RADIUS_SIZE, PREVIEW_SCALE, PREVIEW_SELECTION_SIZE, R_POSITION } from '@app/shared/constant';
import { MouseButton } from '@app/shared/enum';
@Injectable({
    providedIn: 'root',
})
export class PipetteService extends Tool {
    private previewSquare: BoundingBox = new BoundingBox();
    pipettePreviewCtx: CanvasRenderingContext2D;

    constructor(drawingService: DrawingService, colorService: ColorSelectionService) {
        super(drawingService, colorService);
        this.previewSquare.squareSize = PREVIEW_SELECTION_SIZE;
    }

    onMouseDown(event: MouseEvent): void {
        const isLeftClick = event.buttons === MouseButton.Left;
        const isRightClick = event.buttons === MouseButton.Right;
        if (!isLeftClick && !isRightClick) {
            return;
        }

        const mousePosition = this.getPositionFromMouse(event);
        this.colorService.selectNewColor(this.detectColor(mousePosition), isLeftClick);
    }

    private detectColor(coord: Vec2): Color {
        const imageData = this.drawingService.baseCtx.getImageData(coord.x, coord.y, 1, 1).data;

        return new Color(imageData[R_POSITION], imageData[G_POSITION], imageData[B_POSITION], imageData[A_POSITION] / MAX_ALPHA);
    }

    onMouseMove(event: MouseEvent): void {
        const mousePosition = this.getPositionFromMouse(event);
        this.captureZone(mousePosition);
    }

    captureZone(coord: Vec2): void {
        this.previewSquare.squareCenter = coord;
        const previewData = this.drawingService.baseCtx.getImageData(
            this.previewSquare.left,
            this.previewSquare.top,
            this.previewSquare.width,
            this.previewSquare.height,
        );
        const testCanvas = new OffscreenCanvas(previewData.width, previewData.height);
        (testCanvas.getContext('2d') as OffscreenCanvasRenderingContext2D).putImageData(previewData, 0, 0);

        this.pipettePreviewCtx.arc(PREVIEW_RADIUS_SIZE, PREVIEW_RADIUS_SIZE, PREVIEW_RADIUS_SIZE, 0, 2 * Math.PI);
        this.pipettePreviewCtx.save();
        this.pipettePreviewCtx.clip();

        this.pipettePreviewCtx.drawImage(testCanvas, 0, 0, PREVIEW_SELECTION_SIZE * PREVIEW_SCALE, PREVIEW_SELECTION_SIZE * PREVIEW_SCALE);
        this.pipettePreviewCtx.restore();
        this.drawCenter(this.pipettePreviewCtx);
    }

    drawCenter(ctx: CanvasRenderingContext2D): void {
        const width = 3;

        ctx.beginPath();
        ctx.strokeStyle = '#111155';
        ctx.setLineDash([1, 1]);
        ctx.lineWidth = width;

        const radius = 5;
        const xCenter = 50;
        const yCenter = 50;
        ctx.arc(xCenter, yCenter, radius, 0, 2 * Math.PI);

        ctx.stroke();
        ctx.setLineDash([]);
    }
}
