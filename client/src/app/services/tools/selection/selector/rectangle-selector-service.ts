import { Injectable } from '@angular/core';
import { BoundingBox } from '@app/classes/bounding-box';
import { SelectedBox } from '@app/classes/selected-box';
import { SelectionBox } from '@app/classes/selection-box';
import { SelectionImageData } from '@app/classes/selection-image-data';
import { Selector } from '@app/classes/selector';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DASHLINE_EMPTY, DASHLINE_FULL, SELECTION_CONTOUR_BORDER_SIZE, SELECTION_CONTOUR_COLOUR } from '@app/shared/constant';
import { SelectionType } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class RectangleSelectorService extends Selector {
    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.id = SelectionType.rectangle;
    }

    drawSelectionBox(box: SelectionBox, shiftDown: boolean): void {
        const ctx = this.drawingService.previewCtx;
        this.drawingService.clearCanvas(ctx);

        const boundingBox = new BoundingBox();
        boundingBox.updateFromSelectionBox(box, shiftDown);
        ctx.beginPath();
        ctx.rect(boundingBox.position.x, boundingBox.position.y, boundingBox.width, boundingBox.height);

        ctx.lineWidth = SELECTION_CONTOUR_BORDER_SIZE;
        ctx.strokeStyle = 'white';
        ctx.stroke();
        ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);
        ctx.strokeStyle = SELECTION_CONTOUR_COLOUR;
        ctx.stroke();
        ctx.setLineDash([]);
    }

    copyArea(selectedBox: SelectedBox): SelectionImageData {
        const contour = new Path2D();
        contour.rect(selectedBox.position.x, selectedBox.position.y, selectedBox.width, selectedBox.height);
        const imageData = this.drawingService.baseCtx.getImageData(
            selectedBox.position.x,
            selectedBox.position.y,
            selectedBox.width,
            selectedBox.height,
        );
        const selectionImageData = {
            contours: [contour],
            imageData,
        };
        return selectionImageData;
    }
}
