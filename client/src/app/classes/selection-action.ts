import { DrawingToolId } from '@app/shared/enum';
import { SelectedBox } from './selected-box';
import { SelectionImageData } from './selection-image-data';

export interface SelectionAction {
    selectedBox: SelectedBox;
    selectionImageData: SelectionImageData;
    id: DrawingToolId;
}
