import { Injectable } from '@angular/core';
import { DrawingAction } from '@app/classes/drawing-action';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { DEFAULT_OPTIONS } from '@app/shared/constant';
import { drawingToolId, MouseButton } from '@app/shared/enum';
import { UndoRedoService } from './undoredo-service';

@Injectable({
    providedIn: 'root',
})
export class BrushService extends Tool {
    private pathData: Vec2[];

    constructor(drawingService: DrawingService, undoRedoService: UndoRedoService, colorService: ColorSelectionService) {
        super(drawingService, undoRedoService, colorService);
        this.clearPath();
        this.setDefaultOptions();
    }

    setDefaultOptions(): void {
        this.options = {
            primaryColor: this.primaryColor,
            texture: DEFAULT_OPTIONS.texture,
            size: DEFAULT_OPTIONS.size,
        };
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
            const drawingAction = this.getDrawingAction();
            this.undoRedoService.saveAction(drawingAction);
            this.draw(this.drawingService.baseCtx, drawingAction);
        }
        this.mouseDown = false;
        this.clearPath();
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown && event.buttons === MouseButton.Left) {
            const mousePosition = this.getPositionFromMouse(event);
            this.pathData.push(mousePosition);
            // We draw on the preview canvas and erase it each time the mouse is moved
            this.draw(this.drawingService.previewCtx, this.getDrawingAction());
        }
        if (this.mouseDown && !(event.buttons === MouseButton.Left)) {
            this.draw(this.drawingService.baseCtx, this.getDrawingAction());
        }
    }

    draw(ctx: CanvasRenderingContext2D, drawingAction: DrawingAction): void {
        if (drawingAction.path && drawingAction.options.size && drawingAction.options.texture) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            ctx.beginPath();
            ctx.lineCap = 'round';
            ctx.lineWidth = drawingAction.options.size;
            const image = new Image(1, 1);
            image.src = drawingAction.options.texture;
            const pattern = ctx.createPattern(image, 'repeat');
            if (pattern !== null) ctx.strokeStyle = pattern;
            for (const point of drawingAction.path) {
                ctx.lineTo(point.x, point.y);
            }
            ctx.stroke();
            ctx.globalCompositeOperation = 'color';
            ctx.strokeStyle = this.options.primaryColor.getRgbString();
            ctx.stroke();
            ctx.globalCompositeOperation = 'source-over';
        }
    }

    getDrawingAction(): DrawingAction {
        const options = {
            primaryColor: this.primaryColor,
            size: this.options.size,
            texture: this.options.texture,
        };
        return {
            id: drawingToolId.brushService,
            path: this.pathData,
            options,
        };
    }

    private clearPath(): void {
        this.pathData = [];
    }
}
