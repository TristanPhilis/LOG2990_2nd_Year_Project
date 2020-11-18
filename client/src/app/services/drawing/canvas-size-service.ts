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
    }

    setInitialCanvasSize(workzoneWidth: number, workzoneHeight: number): void {
        this.canvasSize = this.getValidCanvasSize(workzoneWidth / 2, workzoneHeight / 2);
        this.previewSize = this.canvasSize;
        this.resizeCanvas(this.drawingService.canvas, this.canvasSize.x, this.canvasSize.y);
        this.resizeCanvas(this.drawingService.previewCanvas, this.canvasSize.x, this.canvasSize.y);
        this.resizeCanvas(this.drawingService.gridCanvas, this.canvasSize.x, this.canvasSize.y);
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
        this.canvasSize = size;
        this.resizeCanvas(this.drawingService.canvas, size.x, size.y);
        this.resizeCanvas(this.drawingService.previewCanvas, size.x, size.y);
        this.resizeCanvas(this.drawingService.gridCanvas, size.x, size.y);
        this.updateAnchorsPosition(size);
        this.drawingService.fillCanvas('white');
        this.drawingService.setImageData(imageData);
        if (this.gridService.isShown) {
            this.gridService.drawGrid();
        }
    }

    updatePreviewSize(event: MouseEvent): void {
        const width = this.resizeX ? event.offsetX : this.previewSize.x;
        const height = this.resizeY ? event.offsetY : this.previewSize.y;
        this.previewSize = this.getValidCanvasSize(width, height);
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
