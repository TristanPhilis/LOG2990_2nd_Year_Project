import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionType } from '@app/shared/enum';
import { SelectedBox } from './selected-box';
import { SelectionBox } from './selection-box';
import { SelectionImageData } from './selection-image-data';

export abstract class Selector {
    id: SelectionType;
    constructor(protected drawingService: DrawingService) {}
    abstract drawSelectionBox(box: SelectionBox, shiftDown: boolean): void;
    abstract copyArea(box: SelectedBox): SelectionImageData;
    abstract clearInitialSelectedZone(selectionImageData: SelectionImageData): void;
}
