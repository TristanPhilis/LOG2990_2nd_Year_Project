import { Injectable } from '@angular/core';
import { DrawingAction } from '@app/classes/drawing-action';
import { Tool } from '@app/classes/tool';
import { ToolOption } from '@app/classes/tool-option';
import { Vec2 } from '@app/classes/vec2';
import { ColorSelectionService } from '@app/services/color/color-selection-service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/tools/undo-redo-service';
import { DEFAULT_OPTIONS, STAMPS } from '@app/shared/constant';
import { DrawingToolId, MouseButton, Options } from '@app/shared/enum';

@Injectable({
    providedIn: 'root',
})
export class StampService extends Tool {
    stampAngle: number;
    stampScaleModifier: number;
    private availableStamps: string[];
    chosenStamp: HTMLImageElement;
    mousePosition: Vec2;
    constructor(drawingService: DrawingService, undoRedoService: UndoRedoService, colorService: ColorSelectionService) {
        super(drawingService, undoRedoService, colorService);
        this.setDefaultOptions();
        this.stampAngle = 0;
        this.availableStamps = STAMPS;
    }

    setDefaultOptions(): void {
        const toolOptions = new Map<Options, ToolOption>([
            [Options.stampSize, { value: DEFAULT_OPTIONS.size, displayName: 'Grosseur' }],
            [Options.stamp, { value: DEFAULT_OPTIONS.stamp, displayName: 'Etampes' }],
        ]);
        this.options = {
            primaryColor: this.primaryColor,
            toolOptions,
        };
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.buttons === MouseButton.Left;
        if (this.mouseDown) {
            this.mousePosition = this.getPositionFromMouse(event);
            this.draw(this.drawingService.baseCtx, this.getDrawingAction());
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            const action = this.getDrawingAction();
            this.undoRedoService.saveAction(action);
        }
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        this.mousePosition = this.getPositionFromMouse(event);
        this.draw(this.drawingService.previewCtx, this.getDrawingAction());
    }

    draw(ctx: CanvasRenderingContext2D, drawingAction: DrawingAction): void {
        const stampScaleModifier = drawingAction.options.toolOptions.get(Options.size);
        const stamp = drawingAction.options.toolOptions.get(Options.stamp);
        if (drawingAction && stamp && stampScaleModifier) {
            console.log('yes');
            this.stampScaleModifier = stampScaleModifier.value;
            this.chosenStamp.src = this.availableStamps[stamp.value];
        }

        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        const imagePositionX = this.mousePosition.x / this.stampScaleModifier - this.chosenStamp.width / 2;
        const imagePositionY = this.mousePosition.y / this.stampScaleModifier - this.chosenStamp.height / 2;
        ctx.scale(this.stampScaleModifier, this.stampScaleModifier);
        ctx.translate(this.mousePosition.x / this.stampScaleModifier, this.mousePosition.y / this.stampScaleModifier);
        ctx.rotate((Math.PI * this.stampAngle) / 180);
        ctx.translate(-this.mousePosition.x / this.stampScaleModifier, -this.mousePosition.y / this.stampScaleModifier);
        ctx.drawImage(this.chosenStamp, imagePositionX, imagePositionY);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    onWheel(event: WheelEvent): void {
        const changeAngle = event.altKey ? 1 : 1 * 15;
        let newAngle = this.stampAngle + Math.sign(event.deltaY) * changeAngle;
        if (newAngle < 0) {
            newAngle += 360;
        } else if (newAngle > 360) {
            newAngle -= 360;
        }

        this.stampAngle = newAngle;
    }

    getDrawingAction(): DrawingAction {
        const options = {
            primaryColor: this.primaryColor,
            toolOptions: this.copyToolOptionMap(this.options.toolOptions),
        };
        return {
            id: DrawingToolId.stampService,
            options,
        };
    }
}
