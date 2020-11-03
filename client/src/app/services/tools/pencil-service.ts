import { Injectable } from '@angular/core';
import { DrawingAction } from '@app/classes/drawing-action';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { drawingToolId, MouseButton } from '@app/shared/enum';
import { UndoRedoService } from './undoredo-service';

@Injectable({
    providedIn: 'root',
})
export class PencilService extends Tool {
    private pathData: Vec2[];

    constructor(drawingService: DrawingService, undoRedoService: UndoRedoService, colorService: ColorSelectionService) {
        super(drawingService, undoRedoService, colorService);
        this.clearPath();
        this.setDefaultOptions();
    }

    setDefaultOptions(): void {
        this.options = {
            primaryColor: this.primaryColor,
            size: 1,
        };
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
            this.clearPath();
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.pathData.push(this.mouseDownCoord);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.undoRedoService.saveAction(this.getDrawingAction());
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.draw(this.drawingService.baseCtx, this.getDrawingAction());
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && event.buttons === MouseButton.Left) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            this.draw(this.drawingService.previewCtx, this.getDrawingAction());
        }
        if (this.mouseDown && !(event.buttons === MouseButton.Left)) {
            this.draw(this.drawingService.baseCtx, this.getDrawingAction());
        }
    }

    draw(ctx: CanvasRenderingContext2D, drawingAction: DrawingAction): void {
        if (drawingAction.path && drawingAction.options.size) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            ctx.beginPath();
            ctx.lineCap = 'round';
            ctx.lineWidth = drawingAction.options.size;
            ctx.strokeStyle = this.options.primaryColor.getRgbString();
            for (const point of drawingAction.path) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.stroke();
        }
    }

    getDrawingAction(): DrawingAction {
        const options = {
            primaryColor: this.primaryColor,
            size: this.options.size,
        };
        return {
            id: drawingToolId.pencilService,
            path: this.pathData,
            options,
        };
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
