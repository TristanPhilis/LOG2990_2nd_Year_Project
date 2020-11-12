import { Injectable } from '@angular/core';
import { BoundingBox } from '@app/classes/bounding-box';
import { SelectionBox } from '@app/classes/selection-box';
import { Selector } from '@app/classes/selector';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { CanvasManipulationService } from '@app/services/utils/canvas-manipulation-service';
import { DASHLINE_EMPTY, DASHLINE_FULL, SELECTION_BOX_BORDER_SIZE, SELECTION_BOX_COLOUR } from '@app/shared/constant';
import { SelectionType } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class EllipseSelectorService extends Selector {
    constructor(drawingService: DrawingService, private canvasUtil: CanvasManipulationService) {
        super(drawingService);
        this.id = SelectionType.ellipse;
    }

    drawSelectionBox(box: SelectionBox, shiftDown: boolean): void {
        const ctx = this.drawingService.previewCtx;
        this.drawingService.clearCanvas(ctx);
        ctx.beginPath();
        ctx.lineWidth = SELECTION_BOX_BORDER_SIZE;
        ctx.strokeStyle = SELECTION_BOX_COLOUR;
        ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);

        const center = shiftDown ? box.squareCenter : box.center;
        ctx.ellipse(center.x, center.y, box.width / 2, box.height / 2, 0, 0, 2 * Math.PI);

        ctx.stroke();
        ctx.setLineDash([]);
    }

    clearBaseCanvasSelectedArea(box: BoundingBox): void {
        const ctx = this.drawingService.baseCtx;
        ctx.beginPath();
        const center = box.center;
        ctx.ellipse(center.x, center.y, box.width / 2, box.height / 2, 0, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
    }

    private getClippedImageData(imageData: ImageData, box: BoundingBox): ImageData {
        const clippingCanvas = this.canvasUtil.createCanvas(imageData.width, imageData.height);
        const clippingContext = clippingCanvas.getContext('2d') as CanvasRenderingContext2D;
        const image = this.canvasUtil.getImageFromImageData(imageData);
        clippingContext.ellipse(box.width / 2, box.height / 2, box.width / 2, box.height / 2, 0, 0, 2 * Math.PI);
        clippingContext.clip();
        clippingContext.drawImage(image, 0, 0);
        return clippingContext.getImageData(0, 0, imageData.width, imageData.height);
    }

    copyArea(box: BoundingBox): ImageData {
        const selectedImageData = this.drawingService.baseCtx.getImageData(box.position.x, box.position.y, box.width, box.height);
        const clippedImageData = this.getClippedImageData(selectedImageData, box);
        this.clearBaseCanvasSelectedArea(box);
        return clippedImageData;
    }
}
