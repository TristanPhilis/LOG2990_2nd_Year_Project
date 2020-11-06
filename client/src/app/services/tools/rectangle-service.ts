import { Injectable } from '@angular/core';
import { BoundingBox } from '@app/classes/bounding-box';
import { DrawingAction } from '@app/classes/drawing-action';
import { SelectionBox } from '@app/classes/selection-box';
import { Tool } from '@app/classes/tool';
import { ToolOption } from '@app/classes/tool-option';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/tools/undo-redo-service';
import { DEFAULT_OPTIONS, SHIFT_KEY } from '@app/shared/constant';
import { DrawingToolId, MouseButton, Options } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class RectangleService extends Tool {
    initialCoord: Vec2;
    selectionBox: SelectionBox;

    constructor(drawingService: DrawingService, undoRedoService: UndoRedoService, colorService: ColorSelectionService) {
        super(drawingService, undoRedoService, colorService);
        this.setDefaultOptions();
        this.selectionBox = new SelectionBox();
    }

    setDefaultOptions(): void {
        const toolOptions = new Map<Options, ToolOption>([
            [Options.size, { value: DEFAULT_OPTIONS.size, displayName: 'Largeur' }],
            [Options.traceType, { value: DEFAULT_OPTIONS.traceType, displayName: 'Type' }],
        ]);
        this.options = {
            primaryColor: this.primaryColor,
            secondaryColor: this.secondaryColor,
            toolOptions,
        };
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            const currentCoord = this.getPositionFromMouse(event);
            this.selectionBox.setAnchor(currentCoord);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const currentCoord = this.getPositionFromMouse(event);
            this.selectionBox.updateOpposingCorner(currentCoord);
            const action = this.getDrawingAction();
            this.undoRedoService.saveAction(action);
            this.draw(this.drawingService.baseCtx, action);
        }
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && event.buttons === MouseButton.Left) {
            const currentCoord = this.getPositionFromMouse(event);
            this.selectionBox.updateOpposingCorner(currentCoord);
            this.draw(this.drawingService.previewCtx, this.getDrawingAction());
        }
        if (this.mouseDown && !(event.buttons === MouseButton.Left)) {
            const action = this.getDrawingAction();
            this.undoRedoService.saveAction(action);
            this.draw(this.drawingService.baseCtx, action);
            this.mouseDown = false;
        }
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
        const size = options.toolOptions.get(Options.size);
        const traceType = options.toolOptions.get(Options.traceType);
        if (drawingAction.box && size && traceType && options.secondaryColor) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            ctx.beginPath();
            ctx.lineWidth = size.value;
            const box = drawingAction.box;
            ctx.rect(box.position.x, box.position.y, box.width, box.height);
            this.fill(ctx, traceType.value, options.primaryColor, options.secondaryColor);
        }
    }

    getDrawingAction(): DrawingAction {
        const options = {
            primaryColor: this.primaryColor,
            secondaryColor: this.secondaryColor,
            toolOptions: this.copyToolOptionMap(this.options.toolOptions),
        };
        const box = new BoundingBox();
        box.updateFromSelectionBox(this.selectionBox, this.shiftDown);
        return {
            id: DrawingToolId.rectangleService,
            box,
            options,
        };
    }
}
