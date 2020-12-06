import { Injectable } from '@angular/core';
import { SelectionImageData } from '@app/classes/selection-image-data';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from '@app/services/tools/selection/selection-service.ts';
@Injectable({
    providedIn: 'root',
})
export class ClipboardService {
    copiedSelectionImageData: SelectionImageData;
    isItemCopied: boolean;
    constructor(private selector: SelectionService, private drawingService: DrawingService) {
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
            const ctx = this.drawingService.baseCtx;
            this.copiedSelectionImageData = this.selector.selectionImageData;
            const emptyImage = ctx.createImageData(this.selector.selectionImageData.imageData);
            this.selector.selectionImageData.imageData = emptyImage;
            this.selector.updateSelectedAreaPreview();
            this.isItemCopied = true;
        }
    }

    delete(): void {
        if (this.selector.isAreaSelected) {
            const ctx = this.drawingService.baseCtx;
            const emptyImage = ctx.createImageData(this.selector.selectionImageData.imageData);
            this.selector.selectionImageData.imageData = emptyImage;
            this.selector.updateSelectedAreaPreview();
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
