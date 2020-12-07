import { Injectable } from '@angular/core';
import { SelectedBox } from '@app/classes/selected-box';
import { SelectionAction } from '@app/classes/selection-action';
import { SelectionImageData } from '@app/classes/selection-image-data';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from '@app/services/tools/selection/selection-service.ts';
@Injectable({
    providedIn: 'root',
})
export class ClipboardService {
    private copiedSelectionImageData: SelectionImageData;
    private selectedBox: SelectedBox;
    private isItemCopied: boolean;
    private action: SelectionAction;
    constructor(private selector: SelectionService, public drawingService: DrawingService) {
        this.isItemCopied = false;
    }

    copy(): void {
        if (!this.selector.isAreaSelected) {
            return;
        }

        this.copiedSelectionImageData = {
            imageData: this.selector.selectionImageData.imageData,
            contour: this.selector.selectionImageData.contour,
            contourImage: this.selector.selectionImageData.contourImage,
            initialSelectedPixels: this.selector.selectionImageData.initialSelectedPixels,
        };
        this.selectedBox = this.translateToOrigin(this.selector.selectedBox.copy());
        this.selectedBox.angle = 0;
        this.isItemCopied = true;
    }

    cut(): void {
        this.copy();
        this.delete();
    }

    delete(): void {
        if (!this.selector.isAreaSelected) {
            return;
        }
        this.drawingService.clearCanvas(this.drawingService.selectionCtx);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.selector.isAreaSelected = false;
        this.action = this.selector.getDrawingAction();
        this.action.selectionImageData.imageData = undefined;
        this.selector.action.next(this.action);
    }

    paste(): void {
        if (!this.isItemCopied) {
            return;
        }

        this.selector.selectedBox = this.selectedBox.copy();
        this.selector.selectedBox.initializeAnchors();
        this.selector.selectionImageData = {
            imageData: this.copiedSelectionImageData.imageData,
            contourImage: this.copiedSelectionImageData.contourImage,
        };
        this.selector.isAreaSelected = true;
        this.selector.updateSelectedAreaPreview();
    }

    private translateToOrigin(selectedBox: SelectedBox): SelectedBox {
        selectedBox.translateX(-Math.min(selectedBox.left, selectedBox.right));
        selectedBox.translateY(-Math.min(selectedBox.top, selectedBox.bottom));
        return selectedBox;
    }
}
