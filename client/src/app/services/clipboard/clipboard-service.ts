import { Injectable } from '@angular/core';
import { SelectionImageData } from '@app/classes/selection-image-data';
import { SelectionService } from '@app/services/tools/selection/selection-service.ts';
@Injectable({
    providedIn: 'root',
})
export class ClipboardService {
    copiedSelectionImageData: SelectionImageData;
    isItemCopied: boolean;
    constructor(private selector: SelectionService) {
        this.isItemCopied = false;
    }

    copy(): void {
        if (this.selector.isAreaSelected) {
            this.copiedSelectionImageData = this.selector.selectionImageData;
            this.isItemCopied = true;
        }
    }

    cut(): void {
        if (this.selector.isAreaSelected) {
            this.copiedSelectionImageData = this.selector.selectionImageData;
            this.selector.isAreaSelected = false;
            this.isItemCopied = true;
        }
    }

    delete(): void {
        if (this.selector.isAreaSelected) {
            this.selector.isAreaSelected = false;
        }
    }

    paste(): void {
        if (this.isItemCopied) {
            this.selector.selectedBox.position.x = 0;
            this.selector.selectedBox.position.y = 0;
            this.selector.selectionImageData = this.copiedSelectionImageData;
            this.selector.isAreaSelected = true;
            this.selector.updateSelectedAreaPreview();
        }
    }
}
