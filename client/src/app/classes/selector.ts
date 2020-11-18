import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionType } from '@app/shared/enum';
import { BoundingBox } from './bounding-box';
import { SelectionBox } from './selection-box';

export abstract class Selector {
    id: SelectionType;
    constructor(protected drawingService: DrawingService) {}
    abstract drawSelectionBox(box: SelectionBox, shiftDown: boolean): void;
    abstract clearBaseCanvasSelectedArea(box: BoundingBox): void;
    abstract copyArea(box: BoundingBox): ImageData;
}
