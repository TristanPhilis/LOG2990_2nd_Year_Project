import { Injectable } from '@angular/core';
import { BoundingBox } from '@app/classes/bounding-box';
import { SelectedBox } from '@app/classes/selected-box';
import { SelectionBox } from '@app/classes/selection-box';
import { SelectionImageData } from '@app/classes/selection-image-data';
import { Selector } from '@app/classes/selector';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DASHLINE_EMPTY, DASHLINE_FULL, SELECTION_CONTOUR_BORDER_SIZE, SELECTION_CONTOUR_COLOUR } from '@app/shared/constant';
import { SelectionType } from '@app/shared/enum';
import { CanvasManipulationService } from '@app/utils/canvas-manipulation-service';

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
        const boundingBox = new BoundingBox();
        boundingBox.updateFromSelectionBox(box, shiftDown);
        ctx.ellipse(boundingBox.center.x, boundingBox.center.y, boundingBox.width / 2, boundingBox.height / 2, 0, 0, 2 * Math.PI);

        ctx.lineWidth = SELECTION_CONTOUR_BORDER_SIZE;
        ctx.strokeStyle = 'white';
        ctx.stroke();
        ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);
        ctx.strokeStyle = SELECTION_CONTOUR_COLOUR;
        ctx.stroke();
        ctx.setLineDash([]);
    }

    copyArea(box: SelectedBox): SelectionImageData {
        const realPositionedContour = new Path2D();
        realPositionedContour.ellipse(box.center.x, box.center.y, box.width / 2, box.height / 2, 0, 0, 2 * Math.PI);
        const selfCenteredContour = new Path2D();
        selfCenteredContour.ellipse(box.width / 2, box.height / 2, box.width / 2, box.height / 2, 0, 0, 2 * Math.PI);
        const selectedImageData = this.drawingService.baseCtx.getImageData(box.position.x, box.position.y, box.width, box.height);
        const clippedImageData = this.getClippedImageData(selectedImageData, selfCenteredContour);
        const selectionImageData = {
            contour: realPositionedContour,
            imageData: clippedImageData,
            contourImage: this.getContourImage(selfCenteredContour, box.width, box.height),
        };
        return selectionImageData;
    }

    clearInitialSelectedZone(selectionImageData: SelectionImageData): void {
        const contour = selectionImageData.contour;
        if (!contour) {
            return;
        }

        const ctx = this.drawingService.baseCtx;
        ctx.fillStyle = 'white';
        ctx.fill(contour);
    }

    private getClippedImageData(imageData: ImageData, contour: Path2D): ImageData {
        const clippingCanvas = this.canvasUtil.createCanvas(imageData.width, imageData.height);
        const clippingContext = clippingCanvas.getContext('2d') as CanvasRenderingContext2D;
        const image = this.canvasUtil.getImageFromImageData(imageData);
        clippingContext.clip(contour);
        clippingContext.drawImage(image, 0, 0);
        return clippingContext.getImageData(0, 0, imageData.width, imageData.height);
    }

    private getContourImage(contour: Path2D, width: number, height: number): CanvasImageSource {
        const canvas = this.canvasUtil.createCanvas(width, height);
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        ctx.strokeStyle = 'white';
        ctx.stroke(contour);
        ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);
        ctx.strokeStyle = SELECTION_CONTOUR_COLOUR;
        ctx.stroke(contour);
        ctx.setLineDash([]);
        return canvas;
    }
}
