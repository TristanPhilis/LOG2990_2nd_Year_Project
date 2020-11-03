import { Injectable } from '@angular/core';
import { BoundingBox } from '@app/classes/bounding-box';
import { DrawingAction } from '@app/classes/drawing-action';
import { SelectionBox } from '@app/classes/selection-box';
import { Tool } from '@app/classes/tool';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SHIFT_KEY } from '@app/shared/constant';
import { drawingToolId, MouseButton, TraceTypes } from '@app/shared/enum';
import { UndoRedoService } from './undoredo-service';

@Injectable({
    providedIn: 'root',
})
export class EllipseService extends Tool {
    selectionBox: SelectionBox;

    constructor(drawingService: DrawingService, undoRedoService: UndoRedoService, colorService: ColorSelectionService) {
        super(drawingService, undoRedoService, colorService);
        this.setDefaultOptions();
        this.selectionBox = new SelectionBox();
    }

    setDefaultOptions(): void {
        this.options.size = 1;
        this.options.traceType = TraceTypes.stroke;
    }

    set _thickness(newThickness: number) {
        this.options.size = newThickness;
    }

    get _thickness(): number {
        return this.options.size ? this.options.size : 1;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            const currentPosition = this.getPositionFromMouse(event);
            this.selectionBox.setAnchor(currentPosition);
        }
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && event.buttons === MouseButton.Left) {
            const currentPosition = this.getPositionFromMouse(event);
            this.selectionBox.updateOpposingCorner(currentPosition);
            this.draw(this.drawingService.previewCtx, this.getDrawingAction());
        }

        if (this.mouseDown && !(event.buttons === MouseButton.Left)) {
            this.mouseDown = false;
            this.draw(this.drawingService.baseCtx, this.getDrawingAction());
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const currentPosition = this.getPositionFromMouse(event);
            this.selectionBox.updateOpposingCorner(currentPosition);
            const drawingAction = this.getDrawingAction();
            this.undoRedoService.saveAction(drawingAction);
            this.draw(this.drawingService.baseCtx, drawingAction);
        }
        this.mouseDown = false;
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === SHIFT_KEY) {
            this.shiftDown = false;
            if (this.mouseDown) {
                this.draw(this.drawingService.previewCtx, this.getDrawingAction());
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === SHIFT_KEY) {
            this.shiftDown = true;
            if (this.mouseDown) {
                this.draw(this.drawingService.previewCtx, this.getDrawingAction());
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, drawingAction: DrawingAction): void {
        const options = drawingAction.options;
        if (drawingAction.box && options.size && options.traceType && options.secondaryColor) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            ctx.beginPath();
            const xRadius = drawingAction.box.width / 2;
            const yRadius = drawingAction.box.height / 2;
            const center = drawingAction.box.center;
            ctx.lineWidth = options.size;

            ctx.ellipse(center.x, center.y, xRadius, yRadius, 0, 0, 2 * Math.PI);
            this.fill(ctx, options.traceType, options.primaryColor, options.secondaryColor);

            ctx.closePath();
        }
    }

    getDrawingAction(): DrawingAction {
        const options = {
            primaryColor: this.primaryColor,
            secondaryColor: this.secondaryColor,
            size: this.options.size,
            traceType: this.options.traceType,
        };
        const box = new BoundingBox();
        box.updateFromSelectionBox(this.selectionBox, this.shiftDown);
        return {
            id: drawingToolId.ellipseService,
            box,
            options,
        };
    }
}
