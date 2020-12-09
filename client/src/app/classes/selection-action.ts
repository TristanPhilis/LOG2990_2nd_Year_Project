import { DrawingToolId, SelectionType } from '@app/shared/enum';
import { SelectedBox } from './selected-box';
import { SelectionImageData } from './selection-image-data';

export interface SelectionAction {
    selectorId: SelectionType;
    selectedBox: SelectedBox;
    selectionImageData: SelectionImageData;
    id: DrawingToolId;
}
