import { Injectable } from '@angular/core';
import { BoundingBox } from '@app/classes/bounding-box';
import { SelectionBox } from '@app/classes/selection-box';
import { Selector } from '@app/classes/selector';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DASHLINE_EMPTY, DASHLINE_FULL, SELECTION_BOX_BORDER_SIZE, SELECTION_BOX_COLOUR } from '@app/shared/constant';
import { SelectionType } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class RectangleSelectorService extends Selector {
    selectionBox: SelectionBox;

    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.id = SelectionType.rectangle;
        this.selectionBox = new SelectionBox();
    }

    drawSelectionBox(box: SelectionBox, shiftDown: boolean): void {
        const ctx = this.drawingService.previewCtx;
        this.drawingService.clearCanvas(ctx);
        ctx.lineWidth = SELECTION_BOX_BORDER_SIZE;
        ctx.beginPath();
        ctx.strokeStyle = SELECTION_BOX_COLOUR;
        ctx.setLineDash([DASHLINE_EMPTY, DASHLINE_FULL]);

        if (shiftDown) {
            const squareSize = box.squareSize;
            ctx.rect(box.squarePosition.x, box.squarePosition.y, squareSize, squareSize);
        } else {
            ctx.rect(box.position.x, box.position.y, box.width, box.height);
        }

        ctx.stroke();
        ctx.setLineDash([]);
    }

    clearBaseCanvasSelectedArea(box: BoundingBox): void {
        this.drawingService.fillCanvasAtLocation('white', box);
    }

    copyArea(box: BoundingBox): ImageData {
        const imageData = this.drawingService.baseCtx.getImageData(box.position.x, box.position.y, box.width, box.height);
        this.clearBaseCanvasSelectedArea(box);
        return imageData;
    }
}
