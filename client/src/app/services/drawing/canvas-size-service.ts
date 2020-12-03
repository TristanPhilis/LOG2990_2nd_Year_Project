import { Injectable } from '@angular/core';
import { ResizeAction } from '@app/classes/resize-action';
import { Vec2 } from '@app/classes/vec2';
import { GridService } from '@app/services/grid/grid-service';
import { Action } from '@app/services/tools/undo-redo-service';
import { MIN_CANVAS_SIZE } from '@app/shared/constant';
import { AnchorsPosition } from '@app/shared/enum';
import { Subject } from 'rxjs';
import { DrawingService } from './drawing.service';

@Injectable({
    providedIn: 'root',
})
export class CanvasSizeService {
    initialCanvasSize: Vec2;
    canvasSize: Vec2;
    previewSize: Vec2;
    bottomAnchor: HTMLDivElement;
    rightAnchor: HTMLDivElement;
    cornerAnchor: HTMLDivElement;
    action: Subject<Action>;

    private resizeX: boolean;
    private resizeY: boolean;

    constructor(private drawingService: DrawingService, private gridService: GridService) {
        this.action = new Subject<Action>();
        this.drawingService.onLoadingImage?.subscribe((size: Vec2) => {
            this.resizeMainCanvas(size.x, size.y);
        });
    }

    setInitialCanvasSize(workzoneWidth: number, workzoneHeight: number): void {
        this.initialCanvasSize = this.getValidCanvasSize(workzoneWidth / 2, workzoneHeight / 2);
        this.canvasSize = this.initialCanvasSize;
        this.previewSize = this.canvasSize;
        this.resizeMainCanvas(this.canvasSize.x, this.canvasSize.y);
        this.resizeCanvas(this.drawingService.selectionCanvas, workzoneWidth, workzoneHeight);
        this.drawingService.fillCanvas('white');
        this.updateAnchorsPosition(this.canvasSize);
    }

    initializeResizing(pressedAnchor: AnchorsPosition): void {
        this.previewSize = this.canvasSize;
        this.resizeX = pressedAnchor === AnchorsPosition.middleRight || pressedAnchor === AnchorsPosition.bottomRight;
        this.resizeY = pressedAnchor === AnchorsPosition.middleBottom || pressedAnchor === AnchorsPosition.bottomRight;
    }

    onMouseMove(event: MouseEvent): void {
        this.updatePreviewSize(event);
        this.updateAnchorsPosition(this.previewSize);
    }

    onMouseUp(event: MouseEvent): void {
        this.updatePreviewSize(event);
        const action = this.getResizeAction();
        this.completeResize(action.newSize, action.imageData);
        this.action.next(action);
    }

    completeResize(size: Vec2, imageData: ImageData): void {
        this.resizeMainCanvas(size.x, size.y);
        this.drawingService.fillCanvas('white');
        this.drawingService.setImageData(imageData);
        if (this.gridService.isShown) {
            this.gridService.drawGrid();
        }
        this.drawingService.autoSave();
    }

    updatePreviewSize(event: MouseEvent): void {
        const width = this.resizeX ? event.offsetX : this.previewSize.x;
        const height = this.resizeY ? event.offsetY : this.previewSize.y;
        this.previewSize = this.getValidCanvasSize(width, height);
    }

    restoreInitialSize(): void {
        this.resizeMainCanvas(this.initialCanvasSize.x, this.initialCanvasSize.y);
        this.drawingService.fillCanvas('white');
        this.drawingService.autoSave();
    }

    private updateAnchorsPosition(size: Vec2): void {
        const borderAdjustment = 3;
        this.bottomAnchor.style.top = size.y + borderAdjustment + 'px';
        this.bottomAnchor.style.left = size.x / 2 + borderAdjustment + 'px';

        this.rightAnchor.style.top = size.y / 2 + borderAdjustment + 'px';
        this.rightAnchor.style.left = size.x + borderAdjustment + 'px';

        this.cornerAnchor.style.top = size.y + borderAdjustment + 'px';
        this.cornerAnchor.style.left = size.x + borderAdjustment + 'px';
    }

    private getValidCanvasSize(width: number, height: number): Vec2 {
        return {
            x: width > MIN_CANVAS_SIZE ? width : MIN_CANVAS_SIZE,
            y: height > MIN_CANVAS_SIZE ? height : MIN_CANVAS_SIZE,
        };
    }

    private resizeMainCanvas(width: number, height: number): void {
        this.canvasSize = { x: width, y: height };
        this.resizeCanvas(this.drawingService.canvas, width, height);
        this.resizeCanvas(this.drawingService.previewCanvas, width, height);
        this.resizeCanvas(this.drawingService.gridCanvas, width, height);
        this.updateAnchorsPosition(this.canvasSize);
    }

    private resizeCanvas(canvas: HTMLCanvasElement, width: number, height: number): void {
        canvas.width = width;
        canvas.height = height;
    }

    private getResizeAction(): ResizeAction {
        return {
            oldSize: this.canvasSize,
            newSize: this.previewSize,
            imageData: this.drawingService.getImageData(),
        };
    }
}
