import { Injectable } from '@angular/core';
import { DrawingAction } from '@app/classes/drawing-action';
import { Tool } from '@app/classes/tool';
import { ToolOption } from '@app/classes/tool-option';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ShortcutService } from '@app/services/shortcut/shortcut-service';
import { DEFAULT_OPTIONS } from '@app/shared/constant';
import { DrawingToolId, MouseButton, Options } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class PencilService extends Tool {
    private pathData: Vec2[];

    constructor(drawingService: DrawingService, colorService: ColorSelectionService, shortcutService: ShortcutService) {
        super(drawingService, colorService, shortcutService);
        this.clearPath();
        this.setDefaultOptions();
    }

    setDefaultOptions(): void {
        const toolOptions = new Map<Options, ToolOption>([[Options.size, { value: DEFAULT_OPTIONS.size, displayName: 'Largeur' }]]);
        this.options = {
            primaryColor: this.primaryColor,
            toolOptions,
        };
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
            this.onActionStart();
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            const action = this.getDrawingAction();
            this.action.next(action);
            this.draw(this.drawingService.baseCtx, action);
        }
        this.mouseDown = false;
        this.clearPath();
        this.onActionFinish();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && event.buttons === MouseButton.Left) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.draw(this.drawingService.previewCtx, this.getDrawingAction());
        }
        if (this.mouseDown && !(event.buttons === MouseButton.Left)) {
            const action = this.getDrawingAction();
            this.action.next(action);
            this.draw(this.drawingService.baseCtx, action);
            this.onActionFinish();
        }
    }

    draw(ctx: CanvasRenderingContext2D, drawingAction: DrawingAction): void {
        const size = drawingAction.options.toolOptions.get(Options.size);
        if (drawingAction.path && size) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            ctx.beginPath();
            ctx.lineCap = 'round';
            ctx.lineWidth = size.value;
            ctx.strokeStyle = drawingAction.options.primaryColor.getRgbString();
            for (const point of drawingAction.path) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.stroke();
        }
        this.drawingService.autoSave();
    }

    getDrawingAction(): DrawingAction {
        const options = {
            primaryColor: this.primaryColor,
            toolOptions: this.copyToolOptionMap(this.options.toolOptions),
        };
        return {
            id: DrawingToolId.pencilService,
            path: this.pathData,
            options,
        };
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
