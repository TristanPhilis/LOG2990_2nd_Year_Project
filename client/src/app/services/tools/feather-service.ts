import { Injectable } from '@angular/core';
import { DrawingAction } from '@app/classes/drawing-action';
import { Tool } from '@app/classes/tool';
import { ToolOption } from '@app/classes/tool-option';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DrawingToolId, MouseButton, Options } from '@app/shared/enum';

export const MINIMUM_FEATHER_SIZE = 2;
@Injectable({
    providedIn: 'root',
})
export class FeatherService extends Tool {
    private pathData: Vec2[];

    constructor(drawingService: DrawingService, colorService: ColorSelectionService) {
        super(drawingService, colorService);
        this.clearPath();
        this.setDefaultOptions();
    }
    setDefaultOptions(): void {
        const toolOptions = new Map<Options, ToolOption>([[Options.size, { value: MINIMUM_FEATHER_SIZE, displayName: 'Largeur' }]]);

        this.options = {
            primaryColor: this.primaryColor,
            toolOptions,
        };
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        if (!this.mouseDown) {
            return;
        }
        this.clearPath();
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.pathData.push(this.mouseDownCoord);
        this.draw(this.drawingService.baseCtx, this.getDrawingAction());
    }

    onMouseUp(event: MouseEvent): void {
        this.mouseDown = false;
        this.action.next(this.getDrawingAction());
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (!this.mouseDown) {
            return;
        }
        this.mouseDownCoord = this.getPositionFromMouse(event);
        this.pathData.push(this.mouseDownCoord);
        this.draw(this.drawingService.baseCtx, this.getDrawingAction());
    }

    draw(ctx: CanvasRenderingContext2D, drawingAction: DrawingAction): void {
        const path = drawingAction.path;
        const size = drawingAction.options.toolOptions.get(Options.size);

        if (path && size) {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = drawingAction.options.primaryColor.getRgbString();
            ctx.moveTo(path[path.length - 1].x, path[path.length - 1].y);
            ctx.lineTo(path[path.length - 1].x + size.value, path[path.length - 1].y + size.value);
            ctx.stroke();
        }
    }

    getDrawingAction(): DrawingAction {
        const options = {
            primaryColor: this.primaryColor,
            toolOptions: this.copyToolOptionMap(this.options.toolOptions),
        };
        return {
            id: DrawingToolId.lineService,
            path: this.pathData,
            options,
        };
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
