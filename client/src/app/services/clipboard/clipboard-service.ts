import { Injectable } from '@angular/core';
import { SelectionImageData } from '@app/classes/selection-image-data';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from '@app/services/tools/selection/selection-service.ts';
import { CanvasManipulationService } from '@app/services/utils/canvas-manipulation-service';
@Injectable({
    providedIn: 'root',
})
export class ClipboardService {
    copiedSelectionImageData: SelectionImageData;
    isItemCopied: boolean;
    constructor(private drawingService: DrawingService, private selector: SelectionService, private canvasUtil: CanvasManipulationService) {
        this.isItemCopied = false;
    }

    copy(): void {
        if (this.selector.isAreaSelected) {
            this.copiedSelectionImageData = this.selector.selectionImageData;
            this.isItemCopied = true;
        }
    }

    cut(): void {
        if (this.isItemCopied) {
            this.copiedSelectionImageData = this.selector.selectionImageData;
            const ctx = this.drawingService.selectionCtx;
            ctx.fillStyle = 'white';
            for (const contour of this.copiedSelectionImageData.contours) {
                ctx.fill(contour);
            }
            this.isItemCopied = true;
        }
    }

    delete(): void {
        if (this.selector.isAreaSelected) {
            this.selector.clearInitialSelectedZone(this.selector.selectionImageData.contours);
        }
    }

    paste(): void {
        if (this.isItemCopied) {
            const image = this.canvasUtil.getImageFromImageData(this.copiedSelectionImageData.imageData);
            this.drawingService.selectionCtx.drawImage(
                image,
                0,
                0,
                this.copiedSelectionImageData.imageData.width,
                this.copiedSelectionImageData.imageData.height,
            );
        }
    }
}
