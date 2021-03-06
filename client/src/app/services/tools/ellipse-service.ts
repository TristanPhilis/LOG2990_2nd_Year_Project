import { Injectable } from '@angular/core';
import { BoundingBox } from '@app/classes/bounding-box';
import { DrawingAction } from '@app/classes/drawing-action';
import { SelectionBox } from '@app/classes/selection-box';
import { Tool } from '@app/classes/tool';
import { ToolOption } from '@app/classes/tool-option';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShortcutService } from '@app/services/shortcut/shortcut-service';
import { DEFAULT_OPTIONS, KEYS } from '@app/shared/constant';
import { DrawingToolId, MouseButton, Options } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class EllipseService extends Tool {
    selectionBox: SelectionBox;

    constructor(drawingService: DrawingService, colorService: ColorSelectionService, shortcutService: ShortcutService) {
        super(drawingService, colorService, shortcutService);
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
            const currentPosition = this.getPositionFromMouse(event);
            this.selectionBox.setAnchor(currentPosition);
            this.onActionStart();
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
            const drawingAction = this.getDrawingAction();
            this.action.next(drawingAction);
            this.draw(this.drawingService.baseCtx, drawingAction);
            this.onActionFinish();
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const currentPosition = this.getPositionFromMouse(event);
            this.selectionBox.updateOpposingCorner(currentPosition);
            const drawingAction = this.getDrawingAction();
            this.action.next(drawingAction);
            this.draw(this.drawingService.baseCtx, drawingAction);
        }
        this.mouseDown = false;
        this.onActionFinish();
    }

    onKeyUp(event: KeyboardEvent): void {
        if (event.key === KEYS.SHIFT) {
            this.shiftDown = false;
            if (this.mouseDown) {
                this.draw(this.drawingService.previewCtx, this.getDrawingAction());
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === KEYS.SHIFT) {
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
            const xRadius = drawingAction.box.width / 2;
            const yRadius = drawingAction.box.height / 2;
            const center = drawingAction.box.center;
            ctx.lineWidth = size.value;

            ctx.ellipse(center.x, center.y, xRadius, yRadius, 0, 0, 2 * Math.PI);
            this.fill(ctx, traceType.value, options.primaryColor, options.secondaryColor);

            ctx.closePath();
        }
        this.drawingService.autoSave();
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
            id: DrawingToolId.ellipseService,
            box,
            options,
        };
    }
}
