import { Injectable } from '@angular/core';
import { SelectedBox } from '@app/classes/selected-box';
import { SelectionBox } from '@app/classes/selection-box';
import { SelectionImageData } from '@app/classes/selection-image-data';
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

    drawSelectionBox(box: SelectionBox, shiftDown: boolean): void {
        return;
    }

    copyArea(box: SelectedBox): SelectionImageData {
        return {
            imageData: new ImageData(0, 0),
            contours: [],
        };
    }
}
