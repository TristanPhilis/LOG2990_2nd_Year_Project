import { Injectable } from '@angular/core';
import { BoundingBox } from '@app/classes/bounding-box';
import { DrawingAction } from '@app/classes/drawing-action';
import { Tool } from '@app/classes/tool';
import { ToolOption } from '@app/classes/tool-option';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShortcutService } from '@app/services/shortcut/shortcut-service';
import { DrawingToolId, MouseButton, Options } from '@app/shared/enum';

export const MINIMUM_ERASER_SIZE = 5;

@Injectable({
    providedIn: 'root',
})
export class EraserService extends Tool {
    private pathData: Vec2[];
    private boundingBox: BoundingBox;

    constructor(drawingService: DrawingService, colorService: ColorSelectionService, shortcutService: ShortcutService) {
        super(drawingService, colorService, shortcutService);
        this.clearPath();
        this.boundingBox = new BoundingBox();
        this.setDefaultOptions();
    }

    setDefaultOptions(): void {
        const toolOptions = new Map<Options, ToolOption>([[Options.eraserSize, { value: MINIMUM_ERASER_SIZE, displayName: 'Grosseur' }]]);
        this.options = {
            primaryColor: this.primaryColor,
            toolOptions,
        };
    }

    onToolChange(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.draw(this.drawingService.baseCtx, this.getDrawingAction());
            this.action.next(this.getDrawingAction());
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        const size = this.options.toolOptions.get(Options.eraserSize);
        this.boundingBox.squareSize = size ? size.value : MINIMUM_ERASER_SIZE;
        const currentCoord = this.getPositionFromMouse(event);
        this.boundingBox.squareCenter = currentCoord;
        this.drawEraserBorder();
        if (this.mouseDown) {
            this.pathData.push(currentCoord);
            this.draw(this.drawingService.baseCtx, this.getDrawingAction());
        }
    }

    drawEraserBorder(): void {
        const ctx = this.drawingService.previewCtx;
        this.drawingService.clearCanvas(ctx);
        ctx.strokeStyle = 'black';
        const borderSize = 1;
        ctx.lineWidth = borderSize;
        ctx.strokeRect(this.boundingBox.position.x, this.boundingBox.position.y, this.boundingBox.width, this.boundingBox.height);
    }

    draw(ctx: CanvasRenderingContext2D, drawingAction: DrawingAction): void {
        const box = drawingAction.box as BoundingBox;
        if (drawingAction.path && box) {
            ctx.fillStyle = 'white';
            for (const point of drawingAction.path) {
                box.squareCenter = point;
                ctx.fillRect(box.position.x, box.position.y, box.width, box.height);
            }
        }
        this.drawingService.autoSave();
    }

    getDrawingAction(): DrawingAction {
        const options = {
            primaryColor: this.primaryColor,
            toolOptions: this.copyToolOptionMap(this.options.toolOptions),
        };
        return {
            id: DrawingToolId.eraserService,
            path: this.pathData,
            box: this.boundingBox.copy(),
            options,
        };
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
