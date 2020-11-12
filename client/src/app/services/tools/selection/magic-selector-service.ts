import { Injectable } from '@angular/core';
import { BoundingBox } from '@app/classes/bounding-box';
import { SelectionBox } from '@app/classes/selection-box';
import { Selector } from '@app/classes/selector';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionType } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class MagicSelectorService extends Selector {
    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.id = SelectionType.magic;
    }
    clearBaseCanvasSelectedArea(box: BoundingBox): void {}
    drawSelectionBox(box: SelectionBox, shiftDown: boolean): void {}
    copyArea(box: BoundingBox): ImageData {
        return new ImageData(0, 0);
    }
}
